import { RequestStatus } from '../request-status.enum';

export class RequestResponseDto {
  id!: number;
  number!: number;
  status!: RequestStatus;
  message?: string | null;
  rejectionReason?: string | null;
  createdAt!: Date;
  announcement!: {
    id: number;
    title: string;
    helper: { id: number; name: string };
    category: { id: number; name: string };
  };
  parent!: { id: number; name: string; email: string };
  child!: { id: number; name: string; age: number };
}
