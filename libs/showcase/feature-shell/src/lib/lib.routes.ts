import { Route } from '@angular/router';
import { ROUTES } from '@cv/shared-util-routing';
import { ShowcaseFeatureShell } from './internal/showcase-feature-shell/showcase-feature-shell';
import { firstVisibleShowcasePage } from './internal/showcase-nav-items';

export const showcaseFeatureShellRoutes: Route[] = [
  {
    path: '',
    component: ShowcaseFeatureShell,
    children: [
      {
        path: '',
        pathMatch: 'full',
        // the first page that is not switched off on the admin page
        redirectTo: firstVisibleShowcasePage,
      },
      {
        path: ROUTES.SHOWCASE.MICRO_FRONTENDS,
        loadComponent: () => import('@cv/showcase-feature-micro-frontends'),
      },
      // always reachable, also when switched off: the footer links here
      {
        path: ROUTES.SHOWCASE.ADMIN,
        loadComponent: () => import('@cv/showcase-feature-admin'),
      },
      {
        path: '**',
        redirectTo: firstVisibleShowcasePage,
      },
    ],
  },
];

export default showcaseFeatureShellRoutes;
