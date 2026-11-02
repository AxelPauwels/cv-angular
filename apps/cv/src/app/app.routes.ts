import { Routes } from '@angular/router';
import { cvMfeWrapperConfig, Wrapper } from '@cv/shared/ui-federation';
import { ROUTES } from '@cv/shared/util-routing';

export const appRoutes: Routes = [
  {
    path: ROUTES.CV.ROOT,
    loadChildren: () => import('@cv/cv/feature-shell'),
  },
  {
    path: ROUTES.SHOWCASE.ROOT,
    loadChildren: () => import('@cv/showcase/feature-shell'),
  },
  {
    path: ROUTES.TECHNICAL.ROOT,
    loadChildren: () => import('@cv/technical/feature-shell'),
  },
  {
    path: ROUTES.MF.CV_MFE,
    component: Wrapper,
    data: { config: cvMfeWrapperConfig },
  },
  {
    path: '**',
    redirectTo: ROUTES.CV.ROOT,
  },
];
