/** Text sizes in percent of the browser's own size; they match the `data-text-size` selectors in the app's 4.elements styles */
export const TEXT_SIZES = [100, 112.5, 125, 150] as const;

export type TextSize = (typeof TEXT_SIZES)[number];

export interface AccessibilitySettings {
  textSize: TextSize;
  reduceMotion: boolean;
  highContrast: boolean;
  wideTextSpacing: boolean;
}

export function isTextSize(size: unknown): size is TextSize {
  return TEXT_SIZES.some((option) => option === size);
}
