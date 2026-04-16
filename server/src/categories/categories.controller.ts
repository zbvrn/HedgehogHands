import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpStatus,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/user.entity';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { SetActiveCategoryDto } from './dto/set-active-category.dto';

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

type AuthRequest = Request & { user?: { role?: string } };

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getCategories(
    @Req() req: AuthRequest,
    @Query('includeInactive') includeInactiveRaw?: string,
  ) {
    const includeInactive = includeInactiveRaw === 'true';
    const role = req.user?.role?.toLowerCase();
    if (includeInactive && role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        problem(HttpStatus.FORBIDDEN, 'Forbidden'),
      );
    }
    return this.categoriesService.list(includeInactive);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Post()
  createCategory(@Body() body: CreateCategoryDto) {
    return this.categoriesService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Put(':id')
  renameCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCategoryDto,
  ) {
    return this.categoriesService.rename(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Patch(':id/active')
  setActive(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: SetActiveCategoryDto,
  ) {
    return this.categoriesService.setActive(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Delete(':id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.delete(id);
  }
}
