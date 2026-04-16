import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsQueryDto } from './dto/announcements-query.dto';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

type AuthRequest = Request & { user?: { sub: number; role: string } };

@UseGuards(JwtAuthGuard)
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  list(@Query() query: AnnouncementsQueryDto) {
    return this.announcementsService.list(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Helper')
  @Get('my')
  listMy(
    @Req() req: AuthRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedPage = Math.max(1, Number(page ?? 1) || 1);
    const parsedLimit = Math.max(1, Number(limit ?? 10) || 10);
    return this.announcementsService.listMy(req.user!.sub, parsedPage, parsedLimit);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Helper')
  @Post()
  create(@Req() req: AuthRequest, @Body() body: CreateAnnouncementDto) {
    return this.announcementsService.create(body, req.user!.sub);
  }

  @Get(':id')
  get(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.announcementsService.getById(id, {
      userId: req.user!.sub,
      role: req.user!.role,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Helper')
  @Put(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateAnnouncementDto,
  ) {
    return this.announcementsService.update(id, body, req.user!.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Helper')
  @Delete(':id')
  delete(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.announcementsService.deactivate(id, req.user!.sub);
  }
}
