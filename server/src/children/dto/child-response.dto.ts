export class ChildResponseDto {
  id!: number;
  name!: string;
  age!: number;
  features?: string | null;
  parentId!: number;
  createdAt!: Date;
}

