import { User } from './user.entity';
import { UserResponseDto } from './dto/user-response.dto';

export class UsersMapper {
  static toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}

