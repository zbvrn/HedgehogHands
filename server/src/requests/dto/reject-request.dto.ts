import { IsString, MaxLength } from 'class-validator';

export class RejectRequestDto {
  @IsString()
  @MaxLength(500)
  reason!: string;
}

