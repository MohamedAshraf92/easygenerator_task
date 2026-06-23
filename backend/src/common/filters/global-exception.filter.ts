import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from 'nestjs-pino';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const { message, errors } = this.extractResponse(exception, isHttp);

    if (isHttp) {
      this.logger.warn({ status, path: request.url }, message);
    } else {
      this.logger.error({ status, path: request.url, err: exception }, message);
    }

    response.status(status).json({
      statusCode: status,
      message: this.toSnakeUpperCase(message),
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private extractResponse(
    exception: unknown,
    isHttp: boolean,
  ): { message: string; errors: string[] } {
    if (!isHttp) return { message: 'Internal server error', errors: [] };

    const httpException = exception as HttpException;
    const res = httpException.getResponse();

    if (typeof res === 'object' && res !== null && 'message' in res) {
      const { message } = res as { message: string | string[] };
      return Array.isArray(message)
        ? { message: 'Validation failed', errors: message }
        : { message, errors: [message] };
    }

    return { message: httpException.message, errors: [httpException.message] };
  }

  private toSnakeUpperCase(str: string): string {
    return str.trim().toUpperCase().replace(/\s+/g, '_');
  }
}
