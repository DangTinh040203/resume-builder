import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * The HTTP header used to carry the correlation / request ID.
 * Incoming values are honored so a request can be traced across services;
 * when absent, the middleware generates one.
 */
export const REQUEST_ID_HEADER = 'x-request-id';

export interface RequestStore {
  requestId: string;
}

/**
 * Per-request storage backed by AsyncLocalStorage. Anything running inside
 * `run()` (controllers, services, the logger) can read the current request ID
 * without it being threaded through function arguments.
 */
const storage = new AsyncLocalStorage<RequestStore>();

export const RequestContext = {
  /** Runs `callback` with the given store bound to the current async context. */
  run<T>(store: RequestStore, callback: () => T): T {
    return storage.run(store, callback);
  },

  /** The request ID of the current async context, or `undefined` outside a request. */
  getRequestId(): string | undefined {
    return storage.getStore()?.requestId;
  },
};
