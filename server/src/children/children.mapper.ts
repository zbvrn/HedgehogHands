import { Child } from './child.entity';
import { ChildResponseDto } from './dto/child-response.dto';

export class ChildrenMapper {
  static toResponse(child: Child): ChildResponseDto {
    return {
      id: child.id,
      name: child.name,
      age: child.age,
      features: child.features ?? null,
      parentId: child.parentId,
      createdAt: child.createdAt,
    };
  }
}

