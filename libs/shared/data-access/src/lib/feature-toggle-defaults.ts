import type { FeatureToggleId } from './feature-toggles';

/**
 * Whether each feature is on (`true`) or off (`false`) by default: what a
 * visitor sees until they change it on the admin page, and what "reset to
 * defaults" goes back to. Change these before building for production.
 *
 * Every toggle in `FEATURE_TOGGLES` needs an entry here; the compiler checks
 * that none is missing and none is unknown.
 */
export const FEATURE_TOGGLE_DEFAULTS = {
  // General
  'tour-button': true,

  // CV
  'cv-personal': true,
  'cv-education': true,
  'cv-experience': true,
  'cv-skills': true,
  'cv-references': true,

  // Showcase
  'main-menu-showcase': true, // main
  'showcase-micro-frontends': false,
  'showcase-admin': false,

  // Technical
  'main-menu-technical': true, // main
  'technical-architecture': false,
  'technical-project-graph': true,
  'technical-graphql-docs': true,
  'technical-code-coverage': true,
  'technical-end-to-end-tests': true,
  'technical-versions': false,

  // Navbar icons
  'navbar-download-cv': true,
  'navbar-theme-switcher': true,
  'navbar-font-switcher': false,
  'navbar-accessibility-switcher': true,
  'navbar-color-scheme-switcher': true,
  'navbar-language-switcher': true,
} as const satisfies Record<FeatureToggleId, boolean>;
