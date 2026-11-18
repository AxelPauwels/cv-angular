/** What an external service is used for, the groups the status page shows */
export type ExternalServiceCategory = 'micro-frontend' | 'cdn' | 'api' | 'link';

/**
 * How a service can be checked from the browser:
 * - `status`: it allows this site to read its responses (CORS), so the HTTP
 *   status code is known
 * - `reachability`: it doesn't (most websites), so only whether it answers at
 *   all is known, not with which status code
 */
export type ExternalServiceCheck = 'status' | 'reachability';

export interface ExternalService {
  /** Unique within the list, stable across checks */
  readonly id: string;
  /** A product or brand name, shown as is (not translated) */
  readonly name: string;
  readonly category: ExternalServiceCategory;
  /** The address that is checked: an http(s) URL */
  readonly url: string;
  readonly check: ExternalServiceCheck;
}

/**
 * - `checking`: no answer yet
 * - `up`: answered in time (green)
 * - `degraded`: answered, but slowly or with a client error such as 404 (orange)
 * - `down`: no answer, a timeout or a server error (red)
 */
export type ServiceHealth = 'checking' | 'up' | 'degraded' | 'down';

/** Why a service is not `up` */
export type ServiceIssue =
  'slow' | 'client-error' | 'server-error' | 'timeout' | 'unreachable';

export interface ServiceCheckResult {
  readonly health: ServiceHealth;
  readonly issue?: ServiceIssue;
  /** Only for services checked with `status` */
  readonly httpStatus?: number;
  /** How long the answer took, in milliseconds */
  readonly responseTimeMs?: number;
}

export type ServiceStatus = ExternalService & ServiceCheckResult;

/** How many services are in each health, e.g. for a summary */
export type ServiceHealthCounts = Readonly<Record<ServiceHealth, number>>;
