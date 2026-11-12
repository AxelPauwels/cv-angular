import { Routes } from '@angular/router';
import { cvMfeWrapperConfig, Wrapper } from '@cv/shared-ui-federation';
import { ROUTES } from '@cv/shared-util-routing';

/** The cv pages lived at the root before the cv got its own main menu item */
const FORMER_CV_PAGES = [
  ROUTES.CV.PERSONAL,
  ROUTES.CV.EDUCATION,
  ROUTES.CV.EXPERIENCE,
  ROUTES.CV.SKILLS,
  ROUTES.CV.REFERENCES,
] as const;

export const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: ROUTES.HOME.ROOT,
  },
  {
    path: ROUTES.HOME.ROOT,
    loadComponent: () => import('@cv/cv-feature-home').then((m) => m.Home),
  },
  {
    path: ROUTES.CV.ROOT,
    loadChildren: () =>
      import('@cv/cv-feature-shell').then((m) => m.cvFeatureShellRoutes),
  },
  {
    path: ROUTES.SHOWCASE.ROOT,
    loadChildren: () =>
      import('@cv/showcase-feature-shell').then(
        (m) => m.showcaseFeatureShellRoutes
      ),
  },
  {
    path: ROUTES.TECHNICAL.ROOT,
    loadChildren: () =>
      import('@cv/technical-feature-shell').then(
        (m) => m.technicalFeatureShellRoutes
      ),
  },
  // old links to the cv pages still find them
  ...FORMER_CV_PAGES.map((page) => ({
    path: page,
    redirectTo: `${ROUTES.CV.ROOT}/${page}`,
  })),
  // the feature toggles page (formerly admin) moved into the showcase; old links still find it
  {
    path: 'admin',
    redirectTo: ROUTES.SHOWCASE.FEATURE_TOGGLES_ROUTER_LINK,
  },
  {
    path: ROUTES.MF.CV_MFE,
    component: Wrapper,
    data: { config: cvMfeWrapperConfig },
  },
  {
    path: '**',
    redirectTo: ROUTES.HOME.ROOT,
  },
];
