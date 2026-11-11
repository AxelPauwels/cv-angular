import { Route } from '@angular/router';
import { CvFeatureShell } from './internal/cv-feature-shell/cv-feature-shell';
import { ROUTES } from '@cv/shared-util-routing';

export const cvFeatureShellRoutes: Route[] = [
  {
    path: '',
    component: CvFeatureShell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: ROUTES.CV.HOME },
      {
        path: ROUTES.CV.HOME,
        loadComponent: () => import('@cv/cv-feature-home').then((m) => m.Home),
      },
      {
        path: ROUTES.CV.PERSONAL,
        loadComponent: () =>
          import('@cv/cv-feature-personal').then((m) => m.PersonalDetails),
      },
      {
        path: ROUTES.CV.EDUCATION,
        loadComponent: () =>
          import('@cv/cv-feature-education').then((m) => m.EducationList),
      },
      {
        path: ROUTES.CV.EXPERIENCE,
        loadComponent: () =>
          import('@cv/cv-feature-experience').then((m) => m.ExperienceList),
      },
      {
        path: ROUTES.CV.SKILLS,
        loadComponent: () =>
          import('@cv/cv-feature-skills').then((m) => m.SkillList),
      },
      {
        path: ROUTES.CV.REFERENCES,
        loadComponent: () =>
          import('@cv/cv-feature-references').then((m) => m.ReferenceList),
      },
    ],
  },
];
