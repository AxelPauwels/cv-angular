import { Route } from '@angular/router';
import { ROUTES } from '@cv/shared-util-routing';
import { ShowcaseFeatureShell } from './internal/showcase-feature-shell/showcase-feature-shell';
import { firstVisibleShowcasePage } from './showcase-nav-items';

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
        loadComponent: () =>
          import('@cv/showcase-feature-micro-frontends').then(
            (m) => m.MicroFrontends
          ),
      },
      {
        path: ROUTES.SHOWCASE.LIGHTHOUSE,
        loadComponent: () =>
          import('@cv/showcase-feature-lighthouse').then(
            (m) => m.LighthouseReport
          ),
      },
      // always reachable, also when switched off: the footer links here
      {
        path: ROUTES.SHOWCASE.FEATURE_TOGGLES,
        loadComponent: () =>
          import('@cv/showcase-feature-admin').then((m) => m.FeatureToggles),
      },
      // the page's old url; links shared before the rename still find it
      {
        path: 'admin',
        redirectTo: ROUTES.SHOWCASE.FEATURE_TOGGLES,
      },
      {
        path: '**',
        redirectTo: firstVisibleShowcasePage,
      },
    ],
  },
];
