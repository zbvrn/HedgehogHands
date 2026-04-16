import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from '../announcements/announcement.entity';
import { Child } from '../children/child.entity';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { UserRole } from '../users/user.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { RejectRequestDto } from './dto/reject-request.dto';
import { RequestResponseDto } from './dto/request-response.dto';
import { RequestsQueryDto } from './dto/requests-query.dto';
import { RequestEntity } from './request.entity';
import { RequestStatus } from './request-status.enum';
import { RequestsMapper } from './requests.mapper';

type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail?: string;
};

const problem = (
  status: number,
  title: string,
  detail?: string,
): ProblemDetails => ({
  type: 'about:blank',
  title,
  status,
  detail,
});

@Injectable()
export class RequestsService {
  private readonly logger = new Logger(RequestsService.name);

  constructor(
    @InjectRepository(RequestEntity)
    private readonly requestsRepository: Repository<RequestEntity>,
    @InjectRepository(Announcement)
    private readonly announcementsRepository: Repository<Announcement>,
    @InjectRepository(Child)
    private readonly childrenRepository: Repository<Child>,
  ) {}

  async create(dto: CreateRequestDto, parentId: number): Promise<RequestResponseDto> {
    try {
      this.logger.log(`Создание заявки родителем #${parentId} на объявление #${dto.announcementId}`);

      const child = await this.childrenRepository.findOne({
        where: { id: dto.childId },
      });
      if (!child) {
        throw new NotFoundException(problem(HttpStatus.NOT_FOUND, 'Child not found'));
      }
      if (child.parentId !== parentId) {
        throw new ForbiddenException(problem(HttpStatus.FORBIDDEN, 'Forbidden'));
      }

      const announcement = await this.announcementsRepository.findOne({
        where: { id: dto.announcementId },
      });
      if (!announcement) {
        throw new NotFoundException(
          problem(HttpStatus.NOT_FOUND, 'Announcement not found'),
        );
      }
      if (!announcement.isActive) {
        throw new NotFoundException(
          problem(HttpStatus.NOT_FOUND, 'Announcement not found'),
        );
      }
      if (announcement.helperId === parentId) {
        throw new ForbiddenException(problem(HttpStatus.FORBIDDEN, 'Forbidden'));
      }

      const exists = await this.requestsRepository.findOne({
        where: { announcementId: dto.announcementId, parentId },
      });
      if (exists) {
        throw new ConflictException(
          problem(HttpStatus.CONFLICT, 'Request already exists'),
        );
      }

      const rawMax = await this.requestsRepository
        .createQueryBuilder('r')
        .select('MAX(r.parentRequestNumber)', 'max')
        .where('r.parentId = :parentId', { parentId })
        .getRawOne<{ max: string | null }>();
      const parentRequestNumber = (rawMax?.max ? Number(rawMax.max) : 0) + 1;

      const entity = this.requestsRepository.create({
        announcementId: dto.announcementId,
        parentId,
        parentRequestNumber,
        childId: dto.childId,
        message: dto.message?.trim() ?? null,
        status: RequestStatus.NEW,
      });
      let saved: RequestEntity;
      try {
        saved = await this.requestsRepository.save(entity);
      } catch (dbError) {
        const code = (dbError as { code?: string } | null)?.code;
        if (code === '23505') {
          throw new ConflictException(
            problem(HttpStatus.CONFLICT, 'Request already exists'),
          );
        }
        throw dbError;
      }
      const loaded = await this.requestsRepository.findOne({
        where: { id: saved.id },
        relations: {
          announcement: { helper: true, category: true },
          parent: true,
          child: true,
        },
      });
      return RequestsMapper.toResponse(loaded ?? saved);
    } catch (error) {
      this.logger.error(
        `Ошибка создания заявки: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async list(
    query: RequestsQueryDto,
    requester: { userId: number; role: string },
  ): Promise<PaginatedResponseDto<RequestResponseDto>> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 10, 50);
    const role = requester.role.trim().toLowerCase();
    try {
      const qb = this.requestsRepository
        .createQueryBuilder('r')
        .leftJoinAndSelect('r.announcement', 'a')
        .leftJoinAndSelect('a.category', 'c')
        .leftJoinAndSelect('a.helper', 'h')
        .leftJoinAndSelect('r.parent', 'p')
        .leftJoinAndSelect('r.child', 'ch')
        .orderBy('r.createdAt', 'DESC');

      if (query.status) {
        qb.andWhere('r.status = :status', { status: query.status });
      }

      if (query.announcementId) {
        qb.andWhere('r.announcementId = :announcementId', {
          announcementId: query.announcementId,
        });
      }

      if (role === UserRole.PARENT) {
        qb.andWhere('r.parentId = :parentId', { parentId: requester.userId });
      } else if (role === UserRole.HELPER) {
        // Helper always sees only requests for own announcements.
        qb.andWhere('a.helperId = :helperId', { helperId: requester.userId });
      } else if (role === UserRole.ADMIN) {
        // no extra constraints
      } else {
        qb.andWhere('1 = 0');
      }

      qb.skip((page - 1) * limit).take(limit);

      const [items, total] = await qb.getManyAndCount();
      const totalPages = Math.max(1, Math.ceil(total / limit));
      return {
        items: items.map(RequestsMapper.toResponse),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      this.logger.error(
        `Ошибка получения заявок: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new HttpException(
        problem(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getById(
    id: number,
    requester: { userId: number; role: string },
  ): Promise<RequestResponseDto> {
    try {
      const request = await this.requestsRepository.findOne({
        where: { id },
        relations: {
          announcement: { helper: true, category: true },
          parent: true,
          child: true,
        },
      });
      if (!request) {
        throw new NotFoundException(problem(HttpStatus.NOT_FOUND, 'Request not found'));
      }

      const role = requester.role.trim().toLowerCase();
      if (role === UserRole.PARENT && request.parentId !== requester.userId) {
        throw new ForbiddenException(problem(HttpStatus.FORBIDDEN, 'Forbidden'));
      }
      if (role === UserRole.HELPER && request.announcement.helperId !== requester.userId) {
        throw new ForbiddenException(problem(HttpStatus.FORBIDDEN, 'Forbidden'));
      }

      return RequestsMapper.toResponse(request);
    } catch (error) {
      this.logger.error(
        `Ошибка получения заявки #${id}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async changeStatus(
    id: number,
    dto: ChangeStatusDto,
    requester: { userId: number; role: string },
  ): Promise<RequestResponseDto> {
    const nextStatus = dto.status;
    try {
      this.logger.log(
        `Помощник #${requester.userId} меняет статус заявки #${id} на ${nextStatus}`,
      );

      const role = requester.role.trim().toLowerCase();
      if (role !== UserRole.HELPER) {
        throw new ForbiddenException(problem(HttpStatus.FORBIDDEN, 'Forbidden'));
      }

      const request = await this.requestsRepository.findOne({
        where: { id },
        relations: {
          announcement: { helper: true, category: true },
          parent: true,
          child: true,
        },
      });
      if (!request) {
        throw new NotFoundException(problem(HttpStatus.NOT_FOUND, 'Request not found'));
      }

      if (request.announcement?.helperId !== requester.userId) {
        this.logger.warn(
          `Помощник #${requester.userId} пытается изменить чужую заявку #${id} (helperId=${request.announcement?.helperId})`,
        );
        throw new ForbiddenException(problem(HttpStatus.FORBIDDEN, 'Forbidden'));
      }

      if (request.status === RequestStatus.RESOLVED || request.status === RequestStatus.REJECTED) {
        throw new BadRequestException(
          problem(HttpStatus.BAD_REQUEST, 'Request status is final'),
        );
      }

      if (!this.isValidTransition(request.status, nextStatus)) {
        throw new BadRequestException(
          problem(HttpStatus.BAD_REQUEST, 'Invalid status transition'),
        );
      }

      request.status = nextStatus;
      await this.requestsRepository.save(request);

      return RequestsMapper.toResponse(request);
    } catch (error) {
      this.logger.error(
        `Ошибка изменения статуса заявки #${id}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async reject(
    id: number,
    dto: RejectRequestDto,
    requester: { userId: number; role: string },
  ): Promise<RequestResponseDto> {
    const reason = dto.reason?.trim() ?? '';
    try {
      this.logger.log(`Помощник #${requester.userId} отклоняет заявку #${id}`);

      const role = requester.role.trim().toLowerCase();
      if (role !== UserRole.HELPER) {
        throw new ForbiddenException(problem(HttpStatus.FORBIDDEN, 'Forbidden'));
      }

      const request = await this.requestsRepository.findOne({
        where: { id },
        relations: {
          announcement: { helper: true, category: true },
          parent: true,
          child: true,
        },
      });
      if (!request) {
        throw new NotFoundException(problem(HttpStatus.NOT_FOUND, 'Request not found'));
      }

      if (request.announcement?.helperId !== requester.userId) {
        this.logger.warn(
          `Помощник #${requester.userId} пытается отклонить чужую заявку #${id} (helperId=${request.announcement?.helperId})`,
        );
        throw new ForbiddenException(problem(HttpStatus.FORBIDDEN, 'Forbidden'));
      }

      if (request.status === RequestStatus.RESOLVED || request.status === RequestStatus.REJECTED) {
        throw new BadRequestException(
          problem(HttpStatus.BAD_REQUEST, 'Request status is final'),
        );
      }

      request.status = RequestStatus.REJECTED;
      request.rejectionReason = reason || null;
      await this.requestsRepository.save(request);

      return RequestsMapper.toResponse(request);
    } catch (error) {
      this.logger.error(
        `Ошибка отклонения заявки #${id}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private isValidTransition(from: RequestStatus, to: RequestStatus): boolean {
    const allowedTransitions: Partial<Record<RequestStatus, RequestStatus[]>> = {
      [RequestStatus.NEW]: [RequestStatus.IN_PROGRESS],
      [RequestStatus.IN_PROGRESS]: [RequestStatus.RESOLVED],
    };

    return allowedTransitions[from]?.includes(to) ?? false;
  }
}
