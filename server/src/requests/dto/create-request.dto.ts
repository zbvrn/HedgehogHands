import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRequestDto {
  @IsInt()
  announcementId!: number;

  @IsInt()
  childId!: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}

