/**
 * @file Global Response Sanitizer Interceptor.
 * @description Intercepts successful responses to log them before sending.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * @class ResponseSanitizerInterceptor
 * @implements NestInterceptor
 * @description Intercepts successful responses globally. Currently logs the response data type.
 * It passes the data through without modification.
 */
@Injectable()
export class ResponseSanitizerInterceptor<T> implements NestInterceptor<T, T> {
  private readonly logger = new Logger(ResponseSanitizerInterceptor.name);

  /**
   * Intercepts the request pipeline and processes the response stream.
   * @param {ExecutionContext} context - The execution context providing details about the current request.
   * @param {CallHandler} next - Provides access to the response stream via handle().
   * @returns {Observable<T>} An observable of the original response data.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<T> {
    const contextType = context.getType();
    this.logger.verbose(`Intercepting response for context type: ${contextType}`);

    return next
      .handle()
      .pipe(
        map(data => {
          // Log the data type being returned
          this.logger.verbose(`Passing through response data of type: ${typeof data}`);

          // Currently returns data as is. DTOs/Entities used in handlers should be clean.
          return data;
        }),
      );
  }
}