/** Color themes; the ids match the `data-theme` selectors in the app's 3.vendors styles */
export const THEMES = [
  { id: 'violet', labelKey: 't.theme.violet' },
  { id: 'azure', labelKey: 't.theme.azure' },
  { id: 'rose', labelKey: 't.theme.rose' },
  { id: 'copper', labelKey: 't.theme.copper' },
  { id: 'ocean', labelKey: 't.theme.ocean' },
  { id: 'teal', labelKey: 't.theme.teal' },
  { id: 'sage', labelKey: 't.theme.sage' },
  { id: 'forest', labelKey: 't.theme.forest' },
  { id: 'gold', labelKey: 't.theme.gold' },
  { id: 'crimson', labelKey: 't.theme.crimson' },
  { id: 'plum', labelKey: 't.theme.plum' },
  { id: 'lavender', labelKey: 't.theme.lavender' },
  { id: 'slate', labelKey: 't.theme.slate' },
  { id: 'sand', labelKey: 't.theme.sand' },
] as const;

export type Theme = (typeof THEMES)[number];
export type ThemeId = Theme['id'];
export type ColorScheme = 'light' | 'dark';

export const DEFAULT_THEME: ThemeId = 'violet';

export function isThemeId(id: string): id is ThemeId {
  return THEMES.some((theme) => theme.id === id);
}
