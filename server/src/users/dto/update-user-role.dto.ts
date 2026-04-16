import { Transform } from 'class-transformer';
import { IsIn, IsString } from 'class-validator';
import { UserRole } from '../user.entity';

export class UpdateUserRoleDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @IsIn([UserRole.PARENT, UserRole.HELPER, UserRole.ADMIN])
  role!: UserRole;
}

