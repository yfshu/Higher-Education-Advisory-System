import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { SupabaseException } from './supabase.exception';

interface SupabaseError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string | null;
}

@Catch(SupabaseException)
export class SupabaseExceptionFilter implements ExceptionFilter {
  catch(exception: SupabaseException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const cause = exception.cause as SupabaseError;
    const causeDetails = cause?.details ?? exception.message;

    // ✅ Log full exception and cause to console
    console.error('SupabaseException caught:', {
      message: exception.message,
      cause: exception.cause,
      stack: exception.stack,
    });

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: exception.message,
      cause: causeDetails,
    });
  }
}
