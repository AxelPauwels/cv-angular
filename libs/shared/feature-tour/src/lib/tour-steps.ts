import { InjectionToken } from '@angular/core';
import { ROUTES } from '@cv/shared-util-routing';
import { FeatureToggleId } from '@cv/shared-data-access';

export interface TourStep {
  id: string;
  /** The page the step is shown on; the tour navigates there first */
  route: string;
  /**
   * CSS selector of the element to highlight. Pages mark targets with a
   * `data-tour` attribute. Without a target the step is centered.
   */
  target?: string;
  /** Short name, shown on the back/next buttons of the neighbouring steps */
  labelKey: string;
  titleKey: string;
  textKey: string;
  /** The step is skipped when one of these is switched off on the admin page */
  toggles?: readonly FeatureToggleId[];
}

function step(
  id: string,
  route: string,
  target?: string,
  toggles?: readonly FeatureToggleId[]
): TourStep {
  return {
    id,
    route,
    target,
    toggles,
    labelKey: `t.tour.step.${id}.label`,
    titleKey: `t.tour.step.${id}.title`,
    textKey: `t.tour.step.${id}.text`,
  };
}

export const DEFAULT_TOUR_STEPS: readonly TourStep[] = [
  step('welcome', ROUTES.CV.HOME_ROUTER_LINK),
  step('themes', ROUTES.CV.HOME_ROUTER_LINK, '[data-tour="theme"] button', [
    'navbar-theme-switcher',
  ]),
  step('fonts', ROUTES.CV.HOME_ROUTER_LINK, '[data-tour="font"] button', [
    'navbar-font-switcher',
  ]),
  step(
    'color-scheme',
    ROUTES.CV.HOME_ROUTER_LINK,
    '[data-tour="color-scheme"] button',
    ['navbar-color-scheme-switcher']
  ),
  step(
    'languages',
    ROUTES.CV.HOME_ROUTER_LINK,
    '[data-tour="language"] button',
    ['navbar-language-switcher']
  ),
  step('cv', ROUTES.CV.PERSONAL_ROUTER_LINK, '[data-tour="cv"] nav', [
    'cv-personal',
  ]),
  step(
    'architecture',
    ROUTES.TECHNICAL.ARCHITECTURE_ROUTER_LINK,
    '[data-tour="technical"] nav',
    ['main-menu-technical', 'technical-architecture']
  ),
  step(
    'showcase',
    ROUTES.SHOWCASE.MICRO_FRONTENDS_ROUTER_LINK,
    '[data-tour="showcase"] nav',
    ['main-menu-showcase', 'showcase-micro-frontends']
  ),
  step('finish', ROUTES.CV.HOME_ROUTER_LINK),
];

/** The steps of the tour, in order; replace it to tour other pages (or in tests) */
export const TOUR_STEPS = new InjectionToken<readonly TourStep[]>(
  'TOUR_STEPS',
  { factory: () => DEFAULT_TOUR_STEPS }
);
