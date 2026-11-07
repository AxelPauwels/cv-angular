/**
 * Color themes in menu order: the colors by hue, the elements and the metals, each
 * group after a divider.
 * The ids match the `data-theme` selectors in the app's 3.vendors styles.
 */
export const THEMES = [
  { id: 'peach', labelKey: 't.theme.peach', group: 'color' },
  { id: 'tangerine', labelKey: 't.theme.tangerine', group: 'color' },
  { id: 'honey', labelKey: 't.theme.honey', group: 'color' },
  { id: 'kiwi', labelKey: 't.theme.kiwi', group: 'color' },
  { id: 'grape', labelKey: 't.theme.grape', group: 'color' },
  { id: 'blackberry', labelKey: 't.theme.blackberry', group: 'color' },
  { id: 'water', labelKey: 't.theme.water', group: 'element' },
  { id: 'earth', labelKey: 't.theme.earth', group: 'element' },
  { id: 'fire', labelKey: 't.theme.fire', group: 'element' },
  { id: 'wind', labelKey: 't.theme.wind', group: 'element' },
  { id: 'gold', labelKey: 't.theme.gold', group: 'metal' },
  { id: 'silver', labelKey: 't.theme.silver', group: 'metal' },
  { id: 'bronze', labelKey: 't.theme.bronze', group: 'metal' },
] as const;

export type Theme = (typeof THEMES)[number];
export type ThemeId = Theme['id'];
export type ColorScheme = 'light' | 'dark';

export const DEFAULT_THEME: ThemeId = 'gold';

export function isThemeId(id: string): id is ThemeId {
  return THEMES.some((theme) => theme.id === id);
}
