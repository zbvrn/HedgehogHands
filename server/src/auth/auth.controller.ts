import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';

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

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const exists = await this.usersService.findByEmail(body.email);
    if (exists) {
      throw new HttpException(
        problem(HttpStatus.BAD_REQUEST, 'Email already registered'),
        HttpStatus.BAD_REQUEST,
      );
    }
    const { accessToken } = await this.authService.register(body);
    return { accessToken };
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(
      body.email,
      body.password,
    );
    if (!user) {
      throw new HttpException(
        problem(HttpStatus.UNAUTHORIZED, 'Invalid email or password'),
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: AuthRequest) {
    const user = req.user;
    if (!user?.sub) {
      throw new HttpException(
        problem(HttpStatus.UNAUTHORIZED, 'Unauthorized'),
        HttpStatus.UNAUTHORIZED,
      );
    }
    const dbUser = await this.usersService.findById(user.sub);
    if (!dbUser) {
      throw new HttpException(
        problem(HttpStatus.UNAUTHORIZED, 'Unauthorized'),
        HttpStatus.UNAUTHORIZED,
      );
    }
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
    };
  }
}

type AuthRequest = Request & { user?: { sub: number } };
 