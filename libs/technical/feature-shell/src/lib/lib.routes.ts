import { Route } from '@angular/router';
import { EmbeddedPage } from '@cv/shared-ui-design-system';
import { ROUTES } from '@cv/shared-util-routing';
import { TechnicalFeatureShell } from './internal/technical-feature-shell/technical-feature-shell';
import { firstVisibleTechnicalPage } from './internal/technical-nav-items';
import {
  CODE_COVERAGE_STYLES,
  END_TO_END_TESTS_STYLES,
  GRAPHQL_DOCS_STYLES,
} from './internal/embedded-report-styles';

export const technicalFeatureShellRoutes: Route[] = [
  {
    path: '',
    component: TechnicalFeatureShell,
    children: [
      {
        path: '',
        pathMatch: 'full',
        // the first page that is not switched off on the admin page
        redirectTo: firstVisibleTechnicalPage,
      },
      {
        path: ROUTES.TECHNICAL.ARCHITECTURE,
        loadComponent: () =>
          import('@cv/technical-feature-architecture').then(
            (m) => m.ArchitectureOverview
          ),
      },
      {
        path: ROUTES.TECHNICAL.PROJECT_GRAPH,
        component: EmbeddedPage,
        data: {
          src: '/project-graph/index.html',
          title: 't.heading.project-graph',
        },
      },
      // reports are copied into the build as assets, see apps/cv/project.json
      {
        path: ROUTES.TECHNICAL.GRAPHQL_DOCS,
        component: EmbeddedPage,
        data: {
          src: '/graphql-docs/index.html',
          title: 't.heading.graphql-docs',
          styles: GRAPHQL_DOCS_STYLES,
        },
      },
      {
        path: ROUTES.TECHNICAL.CODE_COVERAGE,
        component: EmbeddedPage,
        data: {
          src: '/coverage/index.html',
          title: 't.heading.code-coverage',
          styles: CODE_COVERAGE_STYLES,
        },
      },
      {
        path: ROUTES.TECHNICAL.END_TO_END_TESTS,
        component: EmbeddedPage,
        data: {
          src: '/e2e-report/index.html',
          title: 't.heading.end-to-end-tests',
          styles: END_TO_END_TESTS_STYLES,
        },
      },
      {
        path: ROUTES.TECHNICAL.VERSIONS,
        loadComponent: () =>
          import('@cv/technical-feature-versions').then((m) => m.VersionList),
      },
      {
        path: '**',
        redirectTo: firstVisibleTechnicalPage,
      },
    ],
  },
];
