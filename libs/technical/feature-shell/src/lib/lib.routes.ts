import { Type } from '@angular/core';
import { Route } from '@angular/router';
import { UnderConstruction } from '@cv/shared-ui-design-system';
import { ROUTES } from '@cv/shared-util-routing';
import { TechnicalFeatureShell } from './internal/technical-feature-shell/technical-feature-shell';

export const technicalFeatureShellRoutes: Route[] = [
  {
    path: '',
    component: TechnicalFeatureShell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: ROUTES.TECHNICAL.VERSIONS },
      {
        path: ROUTES.TECHNICAL.VERSIONS,
        component: UnderConstruction,
        data: { title: 't.heading.versions' },
      },
      {
        path: '**',
        redirectTo: ROUTES.TECHNICAL.VERSIONS,
      },
    ],
  },
];

export default technicalFeatureShellRoutes;
