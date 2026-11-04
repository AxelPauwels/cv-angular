import { Type } from '@angular/core';
import { Route } from '@angular/router';
import { CvFeatureShell } from './internal/cv-feature-shell/cv-feature-shell';
import { ROUTES } from '@cv/shared-util-routing';

export const cvFeatureShellRoutes: Route[] = [
  {
    path: '',
    component: CvFeatureShell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: ROUTES.CV.PERSONAL },
      {
        path: ROUTES.CV.EXAMPLE,
        loadComponent: () =>
          import('@cv/cv-feature-example').then(
            (mod: { Example: Type<unknown> }) => mod.Example
          ),
      },
      {
        path: ROUTES.CV.PERSONAL,
        loadComponent: () => import('@cv/cv-feature-personal'),
      },
      {
        path: ROUTES.CV.EDUCATION,
        loadComponent: () => import('@cv/cv-feature-education'),
      },
      {
        path: ROUTES.CV.EXPERIENCE,
        loadComponent: () => import('@cv/cv-feature-experience'),
      },
      {
        path: ROUTES.CV.SKILLS,
        loadComponent: () => import('@cv/cv-feature-skills'),
      },
      {
        path: ROUTES.CV.REFERENCES,
        loadComponent: () => import('@cv/cv-feature-references'),
      },
    ],
  },
];

export default cvFeatureShellRoutes;
