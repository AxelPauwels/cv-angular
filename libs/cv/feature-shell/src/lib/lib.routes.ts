import { Type } from '@angular/core';
import { Route } from '@angular/router';
import { UnderConstruction } from '@cv/shared/ui-design-system';
import { CvFeatureShell } from './internal/cv-feature-shell/cv-feature-shell';
import { ROUTES } from '@cv/shared/util-routing';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Example } from '../../../example/example';

export const cvFeatureShellRoutes: Route[] = [
  {
    path: '',
    component: CvFeatureShell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: ROUTES.CV.PERSONAL },
      {
        path: 'example',
        component: Example,
      },
      {
        path: ROUTES.CV.PERSONAL,
        component: UnderConstruction,
        data: { title: 'Personal' },
      },
      {
        path: ROUTES.CV.EDUCATION,
        component: UnderConstruction,
        data: { title: 'Education' },
      },
      {
        path: ROUTES.CV.EXPERIENCE,
        loadComponent: () =>
          import('@cv/cv/feature-experience').then(
            (mod: { ExperienceList: Type<unknown> }) => mod.ExperienceList
          ),
      },
      {
        path: ROUTES.CV.SKILLS,
        component: UnderConstruction,
        data: { title: 'Skills' },
      },
      {
        path: ROUTES.CV.REFERENCES,
        component: UnderConstruction,
        data: { title: 'References' },
      },
    ],
  },
];

export default cvFeatureShellRoutes;
