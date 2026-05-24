import { BadRequestException, Injectable, ValidationPipe, ValidationError } from '@nestjs/common';

@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = this.formatErrors(errors);
        return new BadRequestException({
          message: 'Validation failed',
          error: 'Bad Request',
          details: formattedErrors,
        });
      },
    });
  }

  private formatErrors(errors: ValidationError[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    for (const error of errors) {
      if (error.constraints) {
        result[error.property] = Object.values(error.constraints);
      }
      if (error.children && error.children.length > 0) {
        const nestedErrors = this.formatErrors(error.children);
        for (const [key, msgs] of Object.entries(nestedErrors)) {
          result[`${error.property}.${key}`] = msgs;
        }
      }
    }
    return result;
  }
}
