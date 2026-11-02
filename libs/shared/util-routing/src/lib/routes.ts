import { CV } from './internal/cv.routes';
import { SHOWCASE } from './internal/showcase.routes';
import { TECHNICAL } from './internal/technical.routes';
import { MF } from './internal/micro-frontend.routes';

/**
 * Every route of the app, per domain. `X` is the path segment to use in a
 * route config, `X_ROUTER_LINK` the absolute url to use in a routerLink.
 */
export const ROUTES = {
  CV,
  SHOWCASE,
  TECHNICAL,
  MF,
} as const;

export default ROUTES;
