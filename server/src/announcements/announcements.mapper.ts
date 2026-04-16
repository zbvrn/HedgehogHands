import { Announcement } from './announcement.entity';
import { AnnouncementResponseDto } from './dto/announcement-response.dto';

export class AnnouncementsMapper {
  static toResponse(announcement: Announcement): AnnouncementResponseDto {
    return {
      id: announcement.id,
      title: announcement.title,
      description: announcement.description,
      price: announcement.price ?? null,
      category: {
        id: announcement.categoryId,
        name: announcement.category?.name ?? '',
      },
      helper: {
        id: announcement.helperId,
        name: announcement.helper?.name ?? '',
      },
      isActive: announcement.isActive,
      createdAt: announcement.createdAt,
      updatedAt: announcement.updatedAt,
    };
  }
}

