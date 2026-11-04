import { Route } from '@angular/router';
import { EmbeddedPage } from '@cv/shared-ui-design-system';
import { ROUTES } from '@cv/shared-util-routing';
import { TechnicalFeatureShell } from './internal/technical-feature-shell/technical-feature-shell';

export const technicalFeatureShellRoutes: Route[] = [
  {
    path: '',
    component: TechnicalFeatureShell,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: ROUTES.TECHNICAL.ARCHITECTURE,
      },
      {
        path: ROUTES.TECHNICAL.ARCHITECTURE,
        loadComponent: () => import('@cv/technical-feature-architecture'),
      },
      {
        path: ROUTES.TECHNICAL.PROJECT_GRAPH,
        component: EmbeddedPage,
        data: {
          src: '/project-graph/index.html',
          title: 't.nav.project-graph',
        },
      },
      {
        path: ROUTES.TECHNICAL.VERSIONS,
        loadComponent: () => import('@cv/technical-feature-versions'),
      },
      {
        path: '**',
        redirectTo: ROUTES.TECHNICAL.ARCHITECTURE,
      },
    ],
  },
];

export default technicalFeatureShellRoutes;
