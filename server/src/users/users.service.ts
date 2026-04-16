import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersMapper } from './users.mapper';

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

@Injectable() //декоратор для внедрения в другие классы
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async createUser(params: {
    email: string;
    passwordHash: string;
    name: string;
    role?: UserRole;
  }): Promise<User> {
    const user = this.usersRepository.create({
      email: params.email,
      passwordHash: params.passwordHash,
      name: params.name,
      role: params.role ?? UserRole.PARENT,
    });
    return this.usersRepository.save(user);
  }

  async getParents(): Promise<UserResponseDto[]> {
    return this.listByRole(UserRole.PARENT);
  }

  async getHelpers(): Promise<UserResponseDto[]> {
    return this.listByRole(UserRole.HELPER);
  }

  async updateRole(id: number, role: UserRole): Promise<UserResponseDto> {
    try {
      this.logger.log(`Смена роли пользователя #${id}: ${role}`);
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException(
          problem(HttpStatus.NOT_FOUND, 'User not found'),
        );
      }

      user.role = role;
      const saved = await this.usersRepository.save(user);
      return UsersMapper.toResponse(saved);
    } catch (error) {
      this.logger.error(
        `Ошибка смены роли пользователя #${id}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private async listByRole(role: UserRole): Promise<UserResponseDto[]> {
    try {
      const users = await this.usersRepository.find({
        where: { role },
        order: { id: 'ASC' },
      });
      return users.map(UsersMapper.toResponse);
    } catch (error) {
      this.logger.error(
        `Ошибка получения пользователей (${role}): ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new HttpException(
        problem(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
