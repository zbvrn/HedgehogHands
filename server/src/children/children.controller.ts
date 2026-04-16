import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { ChildrenService } from './children.service';

type AuthRequest = Request & { user?: { sub: number } };

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Parent')
@Controller('children')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Get()
  list(@Req() req: AuthRequest) {
    return this.childrenService.list(req.user!.sub);
  }

  @Post()
  create(@Req() req: AuthRequest, @Body() body: CreateChildDto) {
    return this.childrenService.create(body, req.user!.sub);
  }

  @Get(':id')
  get(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.childrenService.getById(id, req.user!.sub);
  }

  @Put(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateChildDto,
  ) {
    return this.childrenService.update(id, body, req.user!.sub);
  }

  @Delete(':id')
  delete(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.childrenService.delete(id, req.user!.sub);
  }
}

