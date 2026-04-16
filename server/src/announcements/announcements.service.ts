import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../categories/category.entity';
import { UserRole } from '../users/user.entity';
import { Announcement } from './announcement.entity';
import { AnnouncementsMapper } from './announcements.mapper';
import { AnnouncementResponseDto } from './dto/announcement-response.dto';
import { AnnouncementsQueryDto } from './dto/announcements-query.dto';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

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
export class AnnouncementsService {
  private readonly logger = new Logger(AnnouncementsService.name);

  constructor(
    @InjectRepository(Announcement)
    private readonly announcementsRepository: Repository<Announcement>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(
    dto: CreateAnnouncementDto,
    helperId: number,
  ): Promise<AnnouncementResponseDto> {
    try {
      this.logger.log(`Создание объявления помощником #${helperId}`);
      const category = await this.categoriesRepository.findOne({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new BadRequestException(
          problem(HttpStatus.BAD_REQUEST, 'Category not found'),
        );
      }
      if (!category.isActive) {
        throw new BadRequestException(
          problem(HttpStatus.BAD_REQUEST, 'Category is inactive'),
        );
      }

      const announcement = this.announcementsRepository.create({
        title: dto.title.trim(),
        description: dto.description.trim(),
        price: dto.price ?? null,
        categoryId: dto.categoryId,
        helperId,
        isActive: true,
      });
      const saved = await this.announcementsRepository.save(announcement);
      const withRelations = await this.announcementsRepository.findOne({
        where: { id: saved.id },
        relations: { category: true, helper: true },
      });
      return AnnouncementsMapper.toResponse(withRelations ?? saved);
    } catch (error) {
      this.logger.error(
        `Ошибка создания объявления: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async list(
    query: AnnouncementsQueryDto,
  ): Promise<PaginatedResponseDto<AnnouncementResponseDto>> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 10, 50);
    const search = query.search?.trim();
    try {
      const qb = this.announcementsRepository
        .createQueryBuilder('a')
        .leftJoinAndSelect('a.category', 'c')
        .leftJoinAndSelect('a.helper', 'h')
        .where('a.isActive = true');

      if (query.categoryId) {
        qb.andWhere('a.categoryId = :categoryId', { categoryId: query.categoryId });
      }

      if (search) {
        qb.andWhere('(a.title ILIKE :q OR a.description ILIKE :q)', {
          q: `%${search}%`,
        });
      }

      qb.orderBy('a.createdAt', 'DESC');
      qb.skip((page - 1) * limit).take(limit);

      const [items, total] = await qb.getManyAndCount();
      const totalPages = Math.max(1, Math.ceil(total / limit));
      return {
        items: items.map(AnnouncementsMapper.toResponse),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      this.logger.error(
        `Ошибка поиска объявлений: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new HttpException(
        problem(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async listMy(
    helperId: number,
    page = 1,
    limitRaw = 10,
  ): Promise<PaginatedResponseDto<AnnouncementResponseDto>> {
    const limit = Math.min(limitRaw, 50);
    try {
      const qb = this.announcementsRepository
        .createQueryBuilder('a')
        .leftJoinAndSelect('a.category', 'c')
        .leftJoinAndSelect('a.helper', 'h')
        .where('a.helperId = :helperId', { helperId })
        .orderBy('a.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      const [items, total] = await qb.getManyAndCount();
      const totalPages = Math.max(1, Math.ceil(total / limit));
      return {
        items: items.map(AnnouncementsMapper.toResponse),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      this.logger.error(
        `Ошибка получения объявлений помощника #${helperId}: ${error instanceof Error ? error.message : String(error)}`,
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
  ): Promise<AnnouncementResponseDto> {
    try {
      const announcement = await this.announcementsRepository.findOne({
        where: { id },
        relations: { category: true, helper: true },
      });
      if (!announcement) {
        throw new NotFoundException(
          problem(HttpStatus.NOT_FOUND, 'Announcement not found'),
        );
      }

      const role = requester.role.trim().toLowerCase();
      const isOwner = announcement.helperId === requester.userId;
      const canSeeInactive = role === UserRole.ADMIN || isOwner;

      if (!announcement.isActive && !canSeeInactive) {
        throw new NotFoundException(
          problem(HttpStatus.NOT_FOUND, 'Announcement not found'),
        );
      }

      return AnnouncementsMapper.toResponse(announcement);
    } catch (error) {
      this.logger.error(
        `Ошибка получения объявления #${id}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async update(
    id: number,
    dto: UpdateAnnouncementDto,
    helperId: number,
  ): Promise<AnnouncementResponseDto> {
    try {
      this.logger.log(`Обновление объявления #${id} помощником #${helperId}`);
      const announcement = await this.announcementsRepository.findOne({
        where: { id },
        relations: { category: true, helper: true },
      });
      if (!announcement) {
        throw new NotFoundException(
          problem(HttpStatus.NOT_FOUND, 'Announcement not found'),
        );
      }
      if (announcement.helperId !== helperId) {
        throw new ForbiddenException(problem(HttpStatus.FORBIDDEN, 'Forbidden'));
      }

      if (dto.categoryId !== undefined) {
        const category = await this.categoriesRepository.findOne({
          where: { id: dto.categoryId },
        });
        if (!category) {
          throw new BadRequestException(
            problem(HttpStatus.BAD_REQUEST, 'Category not found'),
          );
        }
        if (!category.isActive) {
          throw new BadRequestException(
            problem(HttpStatus.BAD_REQUEST, 'Category is inactive'),
          );
        }
        announcement.categoryId = dto.categoryId;
      }

      if (dto.title !== undefined) announcement.title = dto.title.trim();
      if (dto.description !== undefined) announcement.description = dto.description.trim();
      if (dto.price !== undefined) announcement.price = dto.price ?? null;
      if (dto.isActive !== undefined) announcement.isActive = dto.isActive;

      const saved = await this.announcementsRepository.save(announcement);
      const refreshed = await this.announcementsRepository.findOne({
        where: { id: saved.id },
        relations: { category: true, helper: true },
      });
      return AnnouncementsMapper.toResponse(refreshed ?? saved);
    } catch (error) {
      this.logger.error(
        `Ошибка обновления объявления #${id}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async deactivate(id: number, helperId: number): Promise<{ ok: true }> {
    try {
      this.logger.log(`Деактивация объявления #${id} помощником #${helperId}`);
      const announcement = await this.announcementsRepository.findOne({
        where: { id },
      });
      if (!announcement) {
        throw new NotFoundException(
          problem(HttpStatus.NOT_FOUND, 'Announcement not found'),
        );
      }
      if (announcement.helperId !== helperId) {
        throw new ForbiddenException(problem(HttpStatus.FORBIDDEN, 'Forbidden'));
      }
      announcement.isActive = false;
      await this.announcementsRepository.save(announcement);
      return { ok: true };
    } catch (error) {
      this.logger.error(
        `Ошибка деактивации объявления #${id}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
