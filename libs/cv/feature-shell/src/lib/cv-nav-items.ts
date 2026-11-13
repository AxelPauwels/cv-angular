import { inject } from '@angular/core';
import { NavItem } from '@cv/shared-ui-layout';
import { FeatureToggleId, FeatureToggleService } from '@cv/shared-data-access';
import { ROUTES } from '@cv/shared-util-routing';

/** The pages of the CV domain, each switched on the admin page */
export const CV_NAV_ITEMS: readonly (NavItem & { toggle: FeatureToggleId })[] =
  [
    {
      labelKey: 't.nav.personal',
      path: ROUTES.CV.PERSONAL,
      toggle: 'cv-personal',
    },
    {
      labelKey: 't.nav.education',
      path: ROUTES.CV.EDUCATION,
      toggle: 'cv-education',
    },
    {
      labelKey: 't.nav.experience',
      path: ROUTES.CV.EXPERIENCE,
      toggle: 'cv-experience',
    },
    { labelKey: 't.nav.skills', path: ROUTES.CV.SKILLS, toggle: 'cv-skills' },
    {
      labelKey: 't.nav.references',
      path: ROUTES.CV.REFERENCES,
      toggle: 'cv-references',
    },
  ];

/** For a redirect: the first page that is switched on (in an injection context) */
export function firstVisibleCvPage(): string {
  const toggles = inject(FeatureToggleService).states();
  return (
    CV_NAV_ITEMS.find(({ toggle }) => toggles[toggle])?.path ??
    ROUTES.CV.PERSONAL
  );
}
