import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../users/user.entity';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsIn([UserRole.PARENT, UserRole.HELPER])
  role!: UserRole.PARENT | UserRole.HELPER;
}
