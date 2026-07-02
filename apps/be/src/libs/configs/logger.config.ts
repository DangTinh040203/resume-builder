import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';

import { RequestContext } from '@/libs/context/request-context';

/**
 * Stamps the current request's correlation ID onto every log entry, so all
 * lines emitted while handling one request can be filtered by `requestId`.
 * No-op for logs emitted outside a request (e.g. bootstrap).
 */
const requestIdFormat = winston.format((info) => {
  const requestId = RequestContext.getRequestId();
  if (requestId) {
    Object.assign(info, { requestId });
  }
  return info;
});

export const loggerConfig = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        requestIdFormat(),
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike('CV-Builder', {
          colors: true,
          prettyPrint: true,
        }),
      ),
    }),
  ],
});
