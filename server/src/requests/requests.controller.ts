import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ChangeStatusDto } from './dto/change-status.dto';
import { CreateRequestDto } from './dto/create-request.dto';
import { RejectRequestDto } from './dto/reject-request.dto';
import { RequestsQueryDto } from './dto/requests-query.dto';
import { RequestsService } from './requests.service';

type AuthRequest = Request & { user?: { sub: number; role: string } };

@UseGuards(JwtAuthGuard)
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get()
  list(@Req() req: AuthRequest, @Query() query: RequestsQueryDto) {
    return this.requestsService.list(query, { userId: req.user!.sub, role: req.user!.role });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Parent')
  @Post()
  create(@Req() req: AuthRequest, @Body() body: CreateRequestDto) {
    return this.requestsService.create(body, req.user!.sub);
  }

  @Get(':id')
  get(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.requestsService.getById(id, { userId: req.user!.sub, role: req.user!.role });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Helper')
  @Patch(':id/status')
  changeStatus(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ChangeStatusDto,
  ) {
    return this.requestsService.changeStatus(id, body, {
      userId: req.user!.sub,
      role: req.user!.role,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Helper')
  @Post(':id/reject')
  reject(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: RejectRequestDto,
  ) {
    return this.requestsService.reject(id, body, { userId: req.user!.sub, role: req.user!.role });
  }
}
