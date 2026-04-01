import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail?: string;
};

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const fallback: ProblemDetails = {
      type: 'about:blank',
      title: 'Internal Server Error',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    };

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      let title = HttpStatus[status] ?? 'Error';
      let detail: string | undefined;

      if (typeof payload === 'string') {
        detail = payload;
      } else if (payload && typeof payload === 'object') {
        const payloadRecord = payload as Record<string, unknown>;
        if (typeof payloadRecord.title === 'string') {
          title = payloadRecord.title;
        }
        if (typeof payloadRecord.detail === 'string') {
          detail = payloadRecord.detail;
        } else if (Array.isArray(payloadRecord.message)) {
          detail = payloadRecord.message.join('; ');
        } else if (typeof payloadRecord.message === 'string') {
          detail = payloadRecord.message;
        }
      }

      const problem: ProblemDetails = {
        type: 'about:blank',
        title,
        status,
        ...(detail ? { detail } : {}),
      };

      response.status(status).json(problem);
      return;
    }

    response.status(fallback.status).json(fallback);
  }
}
