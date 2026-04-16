export class AnnouncementResponseDto {
  id!: number;
  title!: string;
  description!: string;
  price?: number | null;
  category!: { id: number; name: string };
  helper!: { id: number; name: string };
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

