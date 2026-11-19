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
> &
  /**
   * A key that already says the same (e.g. the menu label `t.nav.cv`), instead
   * of the step's own `t.tour.step.<id>.label` / `.title`: one Tolgee key less
   */
  Partial<Pick<TourStep, 'labelKey' | 'titleKey'>>;

function step(id: string, route: string, options: StepOptions = {}): TourStep {
  return {
    id,
    route,
    ...options,
    labelKey: options.labelKey ?? `t.tour.step.${id}.label`,
    titleKey: options.titleKey ?? `t.tour.step.${id}.title`,
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
 * The AI assistant's 2.25rem circle, framed as a circle: 6px around it, fully
 * rounded
 */
const AI_ASSISTANT_SPOTLIGHT: SpotlightFrame = { padding: 6, radius: '50%' };

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
    labelKey: 't.nav.cv',
    toggles: ['main-menu-cv', 'cv-personal'],
  }),
  step('technical', ROUTES.TECHNICAL.PROJECT_GRAPH_ROUTER_LINK, {
    ...domainTargets('technical'),
    labelKey: 't.nav.technical',
    titleKey: 't.nav.technical',
    toggles: ['main-menu-technical', 'technical-project-graph'],
  }),
  // the admin page stays reachable when only its menu item is switched off
  step('showcase', ROUTES.SHOWCASE.FEATURE_TOGGLES_ROUTER_LINK, {
    ...domainTargets('showcase'),
    labelKey: 't.nav.showcase',
    titleKey: 't.nav.showcase',
    toggles: ['main-menu-showcase'],
  }),
  // on phones the contact links are at the very bottom of the page. Only the
  // mail, LinkedIn and GitHub icons: the AI assistant next to them has its own step
  step('contact', ROUTES.CV.PERSONAL_ROUTER_LINK, {
    labelKey: 't.heading.contact',
    titleKey: 't.heading.contact',
    target: '[data-tour="contact"] a:not([data-tour="ai-assistant"])',
  }),
  // the round AI assistant link before the contact icons, in a round spotlight
  step('ai-assistant', ROUTES.CV.PERSONAL_ROUTER_LINK, {
    labelKey: 't.nav.ai-assistant',
    titleKey: 't.contact.ai-assistant',
    target: '[data-tour="ai-assistant"]',
    spotlight: AI_ASSISTANT_SPOTLIGHT,
    toggles: ['showcase-ai-assistant'],
  }),
  step('finish', ROUTES.HOME.ROOT_ROUTER_LINK),
];

/** The steps of the tour, in order; replace it to tour other pages (or in tests) */
export const TOUR_STEPS = new InjectionToken<readonly TourStep[]>(
  'TOUR_STEPS',
  { factory: () => DEFAULT_TOUR_STEPS }
);
