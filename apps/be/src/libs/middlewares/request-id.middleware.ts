import { randomUUID } from 'node:crypto';

import { Injectable, type NestMiddleware } from '@nestjs/common';
import { type NextFunction, type Request, type Response } from 'express';

import { REQUEST_ID_HEADER, RequestContext } from '@/libs/context/request-context';

/**
 * Assigns a correlation ID to every request:
 *  - reuses an incoming `x-request-id` (e.g. from nginx or an upstream caller),
 *    otherwise generates a UUID;
 *  - echoes it back on the response header so clients/logs can reference it;
 *  - binds it to the async context so every log line of this request carries it.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const incoming = request.headers[REQUEST_ID_HEADER];
    const requestId =
      (Array.isArray(incoming) ? incoming[0] : incoming) || randomUUID();

    Object.assign(request, { requestId });
    response.setHeader(REQUEST_ID_HEADER, requestId);

    RequestContext.run({ requestId }, () => next());
  }
}
