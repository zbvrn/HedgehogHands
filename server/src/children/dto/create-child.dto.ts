import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateChildDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsInt()
  @Min(0)
  age!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  features?: string;
}

