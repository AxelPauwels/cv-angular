import { inject } from '@angular/core';
import { NavItem } from '@cv/shared-ui-layout';
import { FeatureToggleId, FeatureToggleService } from '@cv/shared-data-access';
import { ROUTES } from '@cv/shared-util-routing';

/** The pages of the Technical domain, each switched on the admin page */
export const TECHNICAL_NAV_ITEMS: readonly (NavItem & {
  toggle: FeatureToggleId;
})[] = [
  {
    labelKey: 't.nav.architecture',
    path: ROUTES.TECHNICAL.ARCHITECTURE,
    toggle: 'technical-architecture',
  },
  {
    labelKey: 't.nav.project-graph',
    path: ROUTES.TECHNICAL.PROJECT_GRAPH,
    toggle: 'technical-project-graph',
  },
  {
    labelKey: 't.nav.graphql-docs',
    path: ROUTES.TECHNICAL.GRAPHQL_DOCS,
    toggle: 'technical-graphql-docs',
  },
  {
    labelKey: 't.nav.code-coverage',
    path: ROUTES.TECHNICAL.CODE_COVERAGE,
    toggle: 'technical-code-coverage',
  },
  {
    labelKey: 't.nav.end-to-end-tests',
    path: ROUTES.TECHNICAL.END_TO_END_TESTS,
    toggle: 'technical-end-to-end-tests',
  },
  {
    labelKey: 't.nav.versions',
    path: ROUTES.TECHNICAL.VERSIONS,
    toggle: 'technical-versions',
  },
];

/** For a redirect: the first page that is switched on (in an injection context) */
export function firstVisibleTechnicalPage(): string {
  const toggles = inject(FeatureToggleService).states();
  return (
    TECHNICAL_NAV_ITEMS.find(({ toggle }) => toggles[toggle])?.path ??
    ROUTES.TECHNICAL.ARCHITECTURE
  );
}
