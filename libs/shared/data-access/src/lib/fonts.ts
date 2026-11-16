/**
 * Font themes; the ids match the `data-font` selectors in the app's 3.vendors styles,
 * where each id maps to a font pairing (body font + heading font).
 * The label is a short alias of the body font's name (the menu has little room), so it is
 * not translated.
 */
export const FONTS = [
  { id: 'red-hat', label: 'Red Hat' },
  { id: 'roboto', label: 'Roboto' },
  { id: 'inter', label: 'Inter' },
  { id: 'ibm-plex', label: 'IBM Plex' },
  { id: 'atkinson', label: 'Atkinson' },
  { id: 'open-sans', label: 'Open Sans' },
  { id: 'nunito', label: 'Nunito' },
  { id: 'source-serif', label: 'Source Serif' },
  { id: 'lexend', label: 'Lexend' },
  { id: 'manrope', label: 'Manrope' },
] as const;

export type Font = (typeof FONTS)[number];
export type FontId = Font['id'];

export const DEFAULT_FONT: FontId = 'red-hat';

export function isFontId(id: string): id is FontId {
  return FONTS.some((font) => font.id === id);
}
