import { IsEnum, IsString } from 'class-validator';
import { RequestStatus } from '../request-status.enum';

export class ChangeStatusDto {
  @IsString()
  @IsEnum(RequestStatus)
  status!: RequestStatus;
}

