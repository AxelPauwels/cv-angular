import { InjectionToken } from '@angular/core';
import { ROUTES } from '@cv/shared-util-routing';
import { FeatureToggleId } from '@cv/shared-data-access';

/** How the spotlight frames its target, instead of the default 8px around */
export interface SpotlightFrame {
  /** Space around the target in px; defaults to the overlay's 8px */
  readonly padding?: number;
  /** CSS border-radius; defaults to the overlay's large corner */
  readonly radius?: string;
  /** Pixels taken off (or, negative, added to) the target's edges */
  readonly trim?: {
    readonly top?: number;
    readonly right?: number;
    readonly bottom?: number;
    readonly left?: number;
  };
}

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
  /**
   * On phones (when the hamburger menu is shown) the tour opens the menu and
   * highlights this instead of `target`; it closes the menu on other steps
   */
  menuTarget?: string;
  /**
   * On phones (when the hamburger menu is shown) the step is centered without
   * a spotlight, for targets that sit far off screen there (e.g. the footer)
   */
  centerOnPhones?: boolean;
  /** The spotlight's frame around `target` */
  spotlight?: SpotlightFrame;
  /** The spotlight's frame around `menuTarget` (phones) */
  menuSpotlight?: SpotlightFrame;
  /** Short name, shown on the back/next buttons of the neighbouring steps */
  labelKey: string;
  titleKey: string;
  textKey: string;
  /** The step is skipped when one of these is switched off on the admin page */
  toggles?: readonly FeatureToggleId[];
  /** The step is skipped when all of these are switched off on the admin page */
  someToggles?: readonly FeatureToggleId[];
}

type StepOptions = Pick<
  TourStep,
  | 'target'
  | 'menuTarget'
  | 'centerOnPhones'
  | 'spotlight'
  | 'menuSpotlight'
  | 'toggles'
  | 'someToggles'
>;

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

/**
 * Everything in the navbar gets the same frame: 5px around the download
 * button (49px high, as 1px comes off the bottom), with its 0.75rem corner
 * grown by those 5px
 */
const NAVBAR_SPOTLIGHT: SpotlightFrame = {
  padding: 5,
  radius: 'calc(0.75rem + 5px)',
  trim: { bottom: 1 },
};

/**
 * A main menu item's tab, or on phones (where the tabs are hidden) the item in
 * the opened hamburger menu
 */
function domainTargets(domain: string): StepOptions {
  return {
    target: `[data-tour="menu-${domain}"]`,
    menuTarget: `[data-tour="menu-panel"] [data-tour="menu-${domain}"]`,
    // the tab is 48px high from the top of the toolbar: on the same line as
    // the download button's frame (-1px to 48px)
    spotlight: { ...NAVBAR_SPOTLIGHT, trim: { top: 4, bottom: 5 } },
    // the menu row on phones: from the 1px divider above it (7px trim minus
    // the 8px padding), 48px high
    menuSpotlight: { trim: { top: 7, bottom: 9 } },
  };
}

export const DEFAULT_TOUR_STEPS: readonly TourStep[] = [
  step('download-cv', ROUTES.HOME.ROOT_ROUTER_LINK, {
    target: '[data-tour="download-cv"] button',
    spotlight: NAVBAR_SPOTLIGHT,
    toggles: ['navbar-download-cv'],
  }),
  // every navbar icon except the download: theme, font, accessibility, ...
  step('settings', ROUTES.HOME.ROOT_ROUTER_LINK, {
    target: '[data-tour="settings"] button',
    spotlight: NAVBAR_SPOTLIGHT,
    someToggles: [
      'navbar-theme-switcher',
      'navbar-font-switcher',
      'navbar-accessibility-switcher',
      'navbar-color-scheme-switcher',
      'navbar-language-switcher',
    ],
  }),
  step('cv', ROUTES.CV.PERSONAL_ROUTER_LINK, {
    ...domainTargets('cv'),
    toggles: ['main-menu-cv', 'cv-personal'],
  }),
  step('technical', ROUTES.TECHNICAL.PROJECT_GRAPH_ROUTER_LINK, {
    ...domainTargets('technical'),
    toggles: ['main-menu-technical', 'technical-project-graph'],
  }),
  // the admin page stays reachable when only its menu item is switched off
  step('showcase', ROUTES.SHOWCASE.FEATURE_TOGGLES_ROUTER_LINK, {
    ...domainTargets('showcase'),
    toggles: ['main-menu-showcase'],
  }),
  // on phones the contact links are at the very bottom of the page
  step('contact', ROUTES.CV.PERSONAL_ROUTER_LINK, {
    target: '[data-tour="contact"] a',
    centerOnPhones: true,
  }),
  step('finish', ROUTES.HOME.ROOT_ROUTER_LINK),
];

/** The steps of the tour, in order; replace it to tour other pages (or in tests) */
export const TOUR_STEPS = new InjectionToken<readonly TourStep[]>(
  'TOUR_STEPS',
  { factory: () => DEFAULT_TOUR_STEPS }
);
