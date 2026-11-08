import { InjectionToken } from '@angular/core';
import { ROUTES } from '@cv/shared-util-routing';
import { FeatureToggleId } from '@cv/shared-data-access';

export interface TourStep {
  id: string;
  /** The page the step is shown on; the tour navigates there first */
  route: string;
  /**
   * CSS selector of the element(s) to highlight. Pages mark targets with a
   * `data-tour` attribute. When it matches several elements, the spotlight
   * covers all of them. Without a target the step is centered.
   */
  target?: string;
  /** Short name, shown on the back/next buttons of the neighbouring steps */
  labelKey: string;
  titleKey: string;
  textKey: string;
  /** The step is skipped when one of these is switched off on the admin page */
  toggles?: readonly FeatureToggleId[];
  /** The step is skipped when all of these are switched off on the admin page */
  someToggles?: readonly FeatureToggleId[];
}

type StepOptions = Pick<TourStep, 'target' | 'toggles' | 'someToggles'>;

function step(id: string, route: string, options: StepOptions = {}): TourStep {
  return {
    id,
    route,
    ...options,
    labelKey: `t.tour.step.${id}.label`,
    titleKey: `t.tour.step.${id}.title`,
    textKey: `t.tour.step.${id}.text`,
  };
}

export const DEFAULT_TOUR_STEPS: readonly TourStep[] = [
  step('download-cv', ROUTES.CV.HOME_ROUTER_LINK, {
    target: '[data-tour="download-cv"] button',
    toggles: ['navbar-download-cv'],
  }),
  // every navbar icon except the download: theme, font, accessibility, ...
  step('settings', ROUTES.CV.HOME_ROUTER_LINK, {
    target: '[data-tour="settings"] button',
    someToggles: [
      'navbar-theme-switcher',
      'navbar-font-switcher',
      'navbar-accessibility-switcher',
      'navbar-color-scheme-switcher',
      'navbar-language-switcher',
    ],
  }),
  step('cv', ROUTES.CV.PERSONAL_ROUTER_LINK, {
    target: '[data-tour="menu-cv"]',
    toggles: ['cv-personal'],
  }),
  step('technical', ROUTES.TECHNICAL.PROJECT_GRAPH_ROUTER_LINK, {
    target: '[data-tour="menu-technical"]',
    toggles: ['main-menu-technical', 'technical-project-graph'],
  }),
  // the admin page stays reachable when only its menu item is switched off
  step('showcase', ROUTES.SHOWCASE.ADMIN_ROUTER_LINK, {
    target: '[data-tour="menu-showcase"]',
    toggles: ['main-menu-showcase'],
  }),
  step('contact', ROUTES.CV.PERSONAL_ROUTER_LINK, {
    target: '[data-tour="contact"] a',
  }),
  step('finish', ROUTES.CV.HOME_ROUTER_LINK),
];

/** The steps of the tour, in order; replace it to tour other pages (or in tests) */
export const TOUR_STEPS = new InjectionToken<readonly TourStep[]>(
  'TOUR_STEPS',
  { factory: () => DEFAULT_TOUR_STEPS }
);
