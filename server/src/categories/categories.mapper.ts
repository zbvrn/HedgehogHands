import { Category } from './category.entity';
import { CategoryResponseDto } from './dto/category-response.dto';

export class CategoriesMapper {
  static toResponse(category: Category): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      isActive: category.isActive,
    };
  }
}

