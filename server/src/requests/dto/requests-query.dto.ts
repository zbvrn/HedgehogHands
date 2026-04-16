import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { RequestStatus } from '../request-status.enum';

export class RequestsQueryDto {
  @IsOptional()
  @IsString()
  @IsIn([
    RequestStatus.NEW,
    RequestStatus.IN_PROGRESS,
    RequestStatus.RESOLVED,
    RequestStatus.REJECTED,
  ])
  status?: RequestStatus;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  announcementId?: number;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : value === 'true'))
  @IsBoolean()
  onlyMy?: boolean;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  limit?: number;
}
