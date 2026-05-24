import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let details: any = null;

    if (exception instanceof HttpException) {
      const resContent = exception.getResponse();
      if (typeof resContent === 'string') {
        message = resContent;
      } else if (typeof resContent === 'object' && resContent !== null) {
        message = (resContent as any).message || message;
        error = (resContent as any).error || error;
        details = (resContent as any).details || null;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    // Log the error
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} failed with: ${exception instanceof Error ? exception.stack : JSON.stringify(exception)}`,
      );
    } else {
      this.logger.warn(`${request.method} ${request.url} returned status ${status}: ${message}`);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message: Array.isArray(message) ? message[0] : message, // Standardize single message string
      allMessages: Array.isArray(message) ? message : [message],
      error,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
