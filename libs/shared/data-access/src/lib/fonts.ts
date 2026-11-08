/**
 * Font themes; the ids match the `data-font` selectors in the app's 3.vendors styles,
 * where each id maps to a font pairing (body font + heading font).
 * The label is the body font's own name, so it is not translated.
 */
export const FONTS = [
  { id: 'red-hat', label: 'Red Hat Display' },
  { id: 'michroma', label: 'Michroma' },
  { id: 'goldman', label: 'Goldman' },
  { id: 'syncopate', label: 'Syncopate' },
  { id: 'bruno-ace', label: 'Bruno Ace SC' },
] as const;

export type Font = (typeof FONTS)[number];
export type FontId = Font['id'];

export const DEFAULT_FONT: FontId = 'red-hat';

export function isFontId(id: string): id is FontId {
  return FONTS.some((font) => font.id === id);
}
