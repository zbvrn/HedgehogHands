import { IsBoolean } from 'class-validator';

export class SetActiveCategoryDto {
  @IsBoolean()
  isActive!: boolean;
}

