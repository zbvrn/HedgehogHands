import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Announcement } from '../announcements/announcement.entity';
import { Child } from '../children/child.entity';
import { RequestEntity } from './request.entity';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';

@Module({
  imports: [TypeOrmModule.forFeature([RequestEntity, Announcement, Child])],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}

