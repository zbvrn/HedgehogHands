import { RequestEntity } from './request.entity';
import { RequestResponseDto } from './dto/request-response.dto';

export class RequestsMapper {
  static toResponse(request: RequestEntity): RequestResponseDto {
    return {
      id: request.id,
      status: request.status,
      message: request.message ?? null,
      rejectionReason: request.rejectionReason ?? null,
      createdAt: request.createdAt,
      announcement: {
        id: request.announcementId,
        title: request.announcement?.title ?? '',
        helper: {
          id: request.announcement?.helperId ?? 0,
          name: request.announcement?.helper?.name ?? '',
        },
        category: {
          id: request.announcement?.categoryId ?? 0,
          name: request.announcement?.category?.name ?? '',
        },
      },
      parent: {
        id: request.parentId,
        name: request.parent?.name ?? '',
        email: request.parent?.email ?? '',
      },
      child: {
        id: request.childId,
        name: request.child?.name ?? '',
        age: request.child?.age ?? 0,
      },
    };
  }
}

