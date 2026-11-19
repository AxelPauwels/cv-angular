import { Route } from '@angular/router';
import { CvFeatureShell } from './internal/cv-feature-shell/cv-feature-shell';
import { ROUTES } from '@cv/shared-util-routing';
import { firstVisibleCvPage } from './cv-nav-items';

export const cvFeatureShellRoutes: Route[] = [
  {
    path: '',
    component: CvFeatureShell,
    children: [
      {
        path: '',
        pathMatch: 'full',
        // the first page that is not switched off on the admin page
        redirectTo: firstVisibleCvPage,
      },
      {
        path: ROUTES.CV.PERSONAL,
        title: 't.nav.personal',
        loadComponent: () =>
          import('@cv/cv-feature-personal').then((m) => m.PersonalDetails),
      },
      {
        path: ROUTES.CV.EDUCATION,
        title: 't.nav.education',
        loadComponent: () =>
          import('@cv/cv-feature-education').then((m) => m.EducationList),
      },
      {
        path: ROUTES.CV.EXPERIENCE,
        title: 't.nav.experience',
        loadComponent: () =>
          import('@cv/cv-feature-experience').then((m) => m.ExperienceList),
      },
      {
        path: ROUTES.CV.SKILLS,
        title: 't.nav.skills',
        loadComponent: () =>
          import('@cv/cv-feature-skills').then((m) => m.SkillList),
      },
      {
        path: ROUTES.CV.REFERENCES,
        title: 't.nav.references',
        loadComponent: () =>
          import('@cv/cv-feature-references').then((m) => m.ReferenceList),
      },
      {
        path: '**',
        redirectTo: firstVisibleCvPage,
      },
    ],
  },
];
