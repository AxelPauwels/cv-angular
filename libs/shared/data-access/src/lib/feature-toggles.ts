import { TranslationKey } from '@cv/shared-util-i18n';
import { FEATURE_TOGGLE_DEFAULTS } from './feature-toggle-defaults';

/**
 * The groups the admin page shows the toggles in: general features, the items
 * of the main menu, the items of each sub menu and the icons of the navbar.
 */
export type FeatureToggleGroup =
  | 'general'
  | 'main-menu'
  | 'cv-menu'
  | 'showcase-menu'
  | 'technical-menu'
  | 'navbar';

export interface FeatureToggleDefinition {
  readonly id: string;
  readonly group: FeatureToggleGroup;
  readonly labelKey: string;
  readonly descriptionKey?: string;
  /**
   * The main menu item this sub menu item belongs to: switching off its last
   * sub menu item switches the main menu item off too
   */
  readonly parent?: string;
}

function menuItem<const Id extends string, const Parent extends string>(
  id: Id,
  group: FeatureToggleGroup,
  labelKey: TranslationKey,
  parent?: Parent
) {
  return { id, group, labelKey, parent } as const;
}

function navbarIcon<const Id extends string>(id: Id, labelKey: TranslationKey) {
  return {
    id,
    group: 'navbar',
    labelKey,
  } as const;
}

/**
 * Every feature that can be switched on or off on the admin page. Add a toggle
 * here (with its translation keys), give it a default in
 * `feature-toggle-defaults.ts` and read it with
 * `FeatureToggleService.isEnabled(id)`.
 */
export const FEATURE_TOGGLES = [
  {
    id: 'tour-button',
    group: 'general',
    labelKey: 't.admin.toggle.tour-button.label',
    descriptionKey: 't.admin.toggle.tour-button.description',
  },

  menuItem('main-menu-technical', 'main-menu', 't.nav.technical'),
  menuItem('main-menu-showcase', 'main-menu', 't.nav.showcase'),

  menuItem('cv-personal', 'cv-menu', 't.nav.personal'),
  menuItem('cv-education', 'cv-menu', 't.nav.education'),
  menuItem('cv-experience', 'cv-menu', 't.nav.experience'),
  menuItem('cv-skills', 'cv-menu', 't.nav.skills'),
  menuItem('cv-references', 'cv-menu', 't.nav.references'),

  menuItem(
    'technical-architecture',
    'technical-menu',
    't.nav.architecture',
    'main-menu-technical'
  ),
  menuItem(
    'technical-project-graph',
    'technical-menu',
    't.nav.project-graph',
    'main-menu-technical'
  ),
  menuItem(
    'technical-graphql-docs',
    'technical-menu',
    't.nav.graphql-docs',
    'main-menu-technical'
  ),
  menuItem(
    'technical-code-coverage',
    'technical-menu',
    't.nav.code-coverage',
    'main-menu-technical'
  ),
  menuItem(
    'technical-end-to-end-tests',
    'technical-menu',
    't.nav.end-to-end-tests',
    'main-menu-technical'
  ),
  menuItem(
    'technical-versions',
    'technical-menu',
    't.nav.versions',
    'main-menu-technical'
  ),

  menuItem(
    'showcase-micro-frontends',
    'showcase-menu',
    't.nav.micro-frontends',
    'main-menu-showcase'
  ),
  // switched off, only its menu item goes: the name in the footer still links to it
  menuItem(
    'showcase-admin',
    'showcase-menu',
    't.nav.admin',
    'main-menu-showcase'
  ),

  navbarIcon('navbar-download-cv', 't.common.download-cv'),
  navbarIcon('navbar-theme-switcher', 't.theme.switch'),
  navbarIcon('navbar-font-switcher', 't.font.switch'),
  navbarIcon('navbar-accessibility-switcher', 't.accessibility.switch'),
  navbarIcon(
    'navbar-color-scheme-switcher',
    't.admin.toggle.color-scheme-switcher.label'
  ),
  navbarIcon('navbar-language-switcher', 't.language.switch'),
] as const satisfies readonly FeatureToggleDefinition[];

export type FeatureToggle = (typeof FEATURE_TOGGLES)[number];
export type FeatureToggleId = FeatureToggle['id'];
export type FeatureToggleStates = Record<FeatureToggleId, boolean>;

export function isFeatureToggleId(value: unknown): value is FeatureToggleId {
  return FEATURE_TOGGLES.some((toggle) => toggle.id === value);
}

/** The defaults from `feature-toggle-defaults.ts`, as a fresh copy */
export function defaultFeatureToggleStates(): FeatureToggleStates {
  return { ...FEATURE_TOGGLE_DEFAULTS };
}

/** A toggle with its id narrowed to the known ids */
export type FeatureToggleInfo = FeatureToggleDefinition & {
  readonly id: FeatureToggleId;
};

/** The toggles of one group, in the order above */
export function featureTogglesInGroup(
  group: FeatureToggleGroup
): readonly FeatureToggleInfo[] {
  return FEATURE_TOGGLES.filter((toggle) => toggle.group === group);
}

/** The sub menu items of a main menu item */
function children(id: FeatureToggleId): readonly FeatureToggle[] {
  return FEATURE_TOGGLES.filter(
    (toggle) => 'parent' in toggle && toggle.parent === id
  );
}

/**
 * A main menu item only shows with at least one of its sub menu items, so:
 * - switching off the last sub menu item switches the main item off
 * - switching a main item on without sub menu items switches them all on
 * - switching the first sub menu item back on switches its main item back on
 *   (a main item switched off on purpose, with sub items on, stays off)
 */
export function withLinkedMenuItems(
  states: FeatureToggleStates,
  changed: FeatureToggleId
): FeatureToggleStates {
  const next = { ...states };
  const toggle = FEATURE_TOGGLES.find(({ id }) => id === changed);
  const parent = toggle && 'parent' in toggle ? toggle.parent : undefined;

  if (isFeatureToggleId(parent)) {
    const on = children(parent).filter(({ id }) => next[id]);
    if (!on.length) {
      next[parent] = false;
    } else if (on.length === 1 && on[0].id === changed) {
      next[parent] = true;
    }
  } else if (next[changed]) {
    const subItems = children(changed);
    if (subItems.length && !subItems.some(({ id }) => next[id])) {
      for (const { id } of subItems) {
        next[id] = true;
      }
    }
  }
  return next;
}

/** Saved states may break the rule above: a main item without sub items is off */
export function withConsistentMenuItems(
  states: FeatureToggleStates
): FeatureToggleStates {
  const next = { ...states };
  for (const { id } of FEATURE_TOGGLES) {
    const subItems = children(id);
    if (subItems.length && !subItems.some((child) => next[child.id])) {
      next[id] = false;
    }
  }
  return next;
}
