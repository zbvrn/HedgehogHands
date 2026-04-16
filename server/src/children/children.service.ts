import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Child } from './child.entity';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { ChildResponseDto } from './dto/child-response.dto';
import { ChildrenMapper } from './children.mapper';

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
export class ChildrenService {
  private readonly logger = new Logger(ChildrenService.name);

  constructor(
    @InjectRepository(Child)
    private readonly childrenRepository: Repository<Child>,
  ) {}

  async create(dto: CreateChildDto, parentId: number): Promise<ChildResponseDto> {
    try {
      this.logger.log(`Создание ребёнка родителем #${parentId}: ${dto.name}`);
      const child = this.childrenRepository.create({
        name: dto.name.trim(),
        age: dto.age,
        features: dto.features?.trim() ?? null,
        parentId,
      });
      const saved = await this.childrenRepository.save(child);
      return ChildrenMapper.toResponse(saved);
    } catch (error) {
      this.logger.error(
        `Ошибка создания ребёнка: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new HttpException(
        problem(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async list(parentId: number): Promise<ChildResponseDto[]> {
    try {
      const children = await this.childrenRepository.find({
        where: { parentId },
        order: { id: 'ASC' },
      });
      return children.map(ChildrenMapper.toResponse);
    } catch (error) {
      this.logger.error(
        `Ошибка получения детей для родителя #${parentId}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new HttpException(
        problem(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getById(id: number, parentId: number): Promise<ChildResponseDto> {
    try {
      const child = await this.childrenRepository.findOne({ where: { id } });
      if (!child) {
        throw new NotFoundException(
          problem(HttpStatus.NOT_FOUND, 'Child not found'),
        );
      }
      if (child.parentId !== parentId) {
        throw new ForbiddenException(problem(HttpStatus.FORBIDDEN, 'Forbidden'));
      }
      return ChildrenMapper.toResponse(child);
    } catch (error) {
      this.logger.error(
        `Ошибка получения ребёнка #${id}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async update(
    id: number,
    dto: UpdateChildDto,
    parentId: number,
  ): Promise<ChildResponseDto> {
    try {
      this.logger.log(`Обновление ребёнка #${id} родителем #${parentId}`);
      const child = await this.childrenRepository.findOne({ where: { id } });
      if (!child) {
        throw new NotFoundException(
          problem(HttpStatus.NOT_FOUND, 'Child not found'),
        );
      }
      if (child.parentId !== parentId) {
        throw new ForbiddenException(problem(HttpStatus.FORBIDDEN, 'Forbidden'));
      }

      if (dto.name !== undefined) child.name = dto.name.trim();
      if (dto.age !== undefined) child.age = dto.age;
      if (dto.features !== undefined) child.features = dto.features?.trim() ?? null;

      const saved = await this.childrenRepository.save(child);
      return ChildrenMapper.toResponse(saved);
    } catch (error) {
      this.logger.error(
        `Ошибка обновления ребёнка #${id}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async delete(id: number, parentId: number): Promise<{ ok: true }> {
    try {
      this.logger.log(`Удаление ребёнка #${id} родителем #${parentId}`);
      const child = await this.childrenRepository.findOne({ where: { id } });
      if (!child) {
        throw new NotFoundException(
          problem(HttpStatus.NOT_FOUND, 'Child not found'),
        );
      }
      if (child.parentId !== parentId) {
        throw new ForbiddenException(problem(HttpStatus.FORBIDDEN, 'Forbidden'));
      }
      await this.childrenRepository.delete({ id });
      return { ok: true };
    } catch (error) {
      this.logger.error(
        `Ошибка удаления ребёнка #${id}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}

