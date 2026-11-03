import { Route } from '@angular/router';
import { UnderConstruction } from '@cv/shared-ui-design-system';
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
        component: UnderConstruction,
        data: { title: 't.heading.graphql-docs' },
      },
      {
        path: ROUTES.SHOWCASE.CODE_COVERAGE,
        component: UnderConstruction,
        data: { title: 't.heading.code-coverage' },
      },
      {
        path: ROUTES.SHOWCASE.END_TO_END_TESTS,
        component: UnderConstruction,
        data: { title: 't.heading.end-to-end-tests' },
      },
      {
        path: '**',
        redirectTo: ROUTES.SHOWCASE.GRAPHQL_DOCS,
      },
    ],
  },
];

export default showcaseFeatureShellRoutes;
