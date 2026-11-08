import { inject } from '@angular/core';
import { NavItem } from '@cv/shared-ui-design-system';
import { FeatureToggleId, FeatureToggleService } from '@cv/shared-data-access';
import { ROUTES } from '@cv/shared-util-routing';

/** The pages of the Showcase domain, each switched on the admin page */
export const SHOWCASE_NAV_ITEMS: readonly (NavItem & {
  toggle: FeatureToggleId;
})[] = [
  {
    labelKey: 't.nav.micro-frontends',
    path: ROUTES.SHOWCASE.MICRO_FRONTENDS,
    toggle: 'showcase-micro-frontends',
  },
  {
    labelKey: 't.nav.admin',
    path: ROUTES.SHOWCASE.ADMIN,
    toggle: 'showcase-admin',
  },
];

/** For a redirect: the first page that is switched on (in an injection context) */
export function firstVisibleShowcasePage(): string {
  const toggles = inject(FeatureToggleService).states();
  return (
    SHOWCASE_NAV_ITEMS.find(({ toggle }) => toggles[toggle])?.path ??
    ROUTES.SHOWCASE.MICRO_FRONTENDS
  );
}
