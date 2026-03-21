import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(params: {
    email: string;
    password: string;
    name: string;
  }): Promise<{ accessToken: string; user: User }> {
    const passwordHash = await bcrypt.hash(params.password, 10);
    const user = await this.usersService.createUser({
      email: params.email,
      passwordHash,
      name: params.name,
      role: UserRole.PARENT,
    });
    const accessToken = await this.signToken(user);
    return { accessToken, user };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return null;
    return user;
  }

  async login(user: User): Promise<{ accessToken: string }> {
    const accessToken = await this.signToken(user);
    return { accessToken };
  }

  private signToken(user: User): Promise<string> {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
  }
}
