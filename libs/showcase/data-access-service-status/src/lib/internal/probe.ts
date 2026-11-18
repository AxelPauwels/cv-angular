import type {
  ExternalService,
  ServiceCheckResult,
} from '../types/service-status.types';

/** An answer that takes longer than this counts as slow (orange) */
export const SLOW_AFTER_MS = 2000;

/** No answer within this time counts as down (red) */
export const TIMEOUT_AFTER_MS = 8000;

export interface ProbeOptions {
  readonly fetch?: typeof fetch;
  readonly now?: () => number;
  readonly slowAfterMs?: number;
  readonly timeoutAfterMs?: number;
}

/**
 * Checks one service from the browser, without cookies, referrer or cache, so
 * the check says nothing about the visitor and always reaches the service.
 *
 * A `status` check reads the HTTP status (the service allows it with CORS).
 * A `reachability` check can't (an opaque `no-cors` response): it only knows
 * the service answered, so a 404 page there still counts as reachable.
 */
export async function probe(
  service: ExternalService,
  {
    fetch: fetchFn = globalThis.fetch.bind(globalThis),
    now = () => performance.now(),
    slowAfterMs = SLOW_AFTER_MS,
    timeoutAfterMs = TIMEOUT_AFTER_MS,
  }: ProbeOptions = {}
): Promise<ServiceCheckResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutAfterMs);
  const start = now();
  try {
    const response = await fetchFn(service.url, {
      method: service.check === 'status' ? 'GET' : 'HEAD',
      mode: service.check === 'status' ? 'cors' : 'no-cors',
      credentials: 'omit',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      redirect: 'follow',
      signal: controller.signal,
    });
    const responseTimeMs = Math.round(now() - start);
    // only the headers are needed: stop downloading the body
    void response.body?.cancel().catch(() => undefined);

    if (service.check === 'status') {
      const httpStatus = response.status;
      if (httpStatus >= 500) {
        return {
          health: 'down',
          issue: 'server-error',
          httpStatus,
          responseTimeMs,
        };
      }
      if (httpStatus >= 400) {
        return {
          health: 'degraded',
          issue: 'client-error',
          httpStatus,
          responseTimeMs,
        };
      }
      return withSpeed(
        { health: 'up', httpStatus, responseTimeMs },
        slowAfterMs
      );
    }
    return withSpeed({ health: 'up', responseTimeMs }, slowAfterMs);
  } catch {
    return controller.signal.aborted
      ? { health: 'down', issue: 'timeout' }
      : { health: 'down', issue: 'unreachable' };
  } finally {
    clearTimeout(timeout);
  }
}

function withSpeed(
  result: ServiceCheckResult,
  slowAfterMs: number
): ServiceCheckResult {
  return (result.responseTimeMs ?? 0) > slowAfterMs
    ? { ...result, health: 'degraded', issue: 'slow' }
    : result;
}
