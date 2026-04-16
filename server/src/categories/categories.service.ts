import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { SetActiveCategoryDto } from './dto/set-active-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CategoriesMapper } from './categories.mapper';

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
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async list(includeInactive: boolean): Promise<CategoryResponseDto[]> {
    try {
      const categories = await this.categoriesRepository.find({
        where: includeInactive ? {} : { isActive: true },
        order: { name: 'ASC' },
      });
      return categories.map(CategoriesMapper.toResponse);
    } catch (error) {
      this.logger.error(
        `Ошибка получения категорий: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new HttpException(
        problem(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const name = dto.name.trim();
    try {
      this.logger.log(`Создание категории: ${name}`);
      if (!name) {
        throw new BadRequestException(
          problem(HttpStatus.BAD_REQUEST, 'Category name is required'),
        );
      }

      const exists = await this.categoriesRepository.findOne({ where: { name } });
      if (exists) {
        throw new BadRequestException(
          problem(HttpStatus.BAD_REQUEST, 'Category name must be unique'),
        );
      }

      const category = this.categoriesRepository.create({ name, isActive: true });
      const saved = await this.categoriesRepository.save(category);
      return CategoriesMapper.toResponse(saved);
    } catch (error) {
      this.logger.error(
        `Ошибка создания категории: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async rename(id: number, dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const name = dto.name.trim();
    try {
      this.logger.log(`Переименование категории #${id}: ${name}`);
      if (!name) {
        throw new BadRequestException(
          problem(HttpStatus.BAD_REQUEST, 'Category name is required'),
        );
      }

      const category = await this.categoriesRepository.findOne({ where: { id } });
      if (!category) {
        throw new NotFoundException(
          problem(HttpStatus.NOT_FOUND, 'Category not found'),
        );
      }

      const exists = await this.categoriesRepository.findOne({ where: { name } });
      if (exists && exists.id !== id) {
        throw new BadRequestException(
          problem(HttpStatus.BAD_REQUEST, 'Category name must be unique'),
        );
      }

      category.name = name;
      const saved = await this.categoriesRepository.save(category);
      return CategoriesMapper.toResponse(saved);
    } catch (error) {
      this.logger.error(
        `Ошибка переименования категории #${id}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async setActive(
    id: number,
    dto: SetActiveCategoryDto,
  ): Promise<CategoryResponseDto> {
    try {
      this.logger.log(`Смена активности категории #${id}: ${dto.isActive}`);
      const category = await this.categoriesRepository.findOne({ where: { id } });
      if (!category) {
        throw new NotFoundException(
          problem(HttpStatus.NOT_FOUND, 'Category not found'),
        );
      }

      category.isActive = dto.isActive;
      const saved = await this.categoriesRepository.save(category);
      return CategoriesMapper.toResponse(saved);
    } catch (error) {
      this.logger.error(
        `Ошибка смены активности категории #${id}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}

