import { NavItem } from '@cv/shared-ui-design-system';
import { FeatureToggleId } from '@cv/shared-data-access';
import { ROUTES } from '@cv/shared-util-routing';

/** The pages of the CV domain; all but home are switched on the admin page */
export const CV_NAV_ITEMS: readonly (NavItem & { toggle?: FeatureToggleId })[] =
  [
    { labelKey: 't.nav.home', path: ROUTES.CV.HOME, icon: 'home' },
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
