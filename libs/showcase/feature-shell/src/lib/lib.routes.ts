import { Route } from '@angular/router';
import { EmbeddedPage } from '@cv/shared-ui-design-system';
import { ROUTES } from '@cv/shared-util-routing';
import { ShowcaseFeatureShell } from './internal/showcase-feature-shell/showcase-feature-shell';

export const showcaseFeatureShellRoutes: Route[] = [
  {
    path: '',
    component: ShowcaseFeatureShell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: ROUTES.SHOWCASE.GRAPHQL_DOCS },
      {
        path: ROUTES.SHOWCASE.GRAPHQL_DOCS,
        component: EmbeddedPage,
        data: { src: '/graphql-docs/index.html', title: 't.nav.graphql-docs' },
      },
      // reports are copied into the build as assets, see apps/cv/project.json
      {
        path: ROUTES.SHOWCASE.CODE_COVERAGE,
        component: EmbeddedPage,
        data: { src: '/coverage/index.html', title: 't.nav.code-coverage' },
      },
      {
        path: ROUTES.SHOWCASE.END_TO_END_TESTS,
        component: EmbeddedPage,
        data: {
          src: '/e2e-report/index.html',
          title: 't.nav.end-to-end-tests',
        },
      },
      {
        path: ROUTES.SHOWCASE.MICRO_FRONTENDS,
        loadComponent: () => import('@cv/showcase-feature-micro-frontends'),
      },
      {
        path: '**',
        redirectTo: ROUTES.SHOWCASE.GRAPHQL_DOCS,
      },
    ],
  },
];

export default showcaseFeatureShellRoutes;
