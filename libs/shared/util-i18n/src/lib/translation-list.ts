/**
 * Separates the items of a list stored in one translation key, so a list of
 * steps or options costs one Tolgee key instead of one per item:
 *
 * `"First step.||Second step.||Third step."`
 *
 * Two pipes, because a single `|` already appears in ordinary texts.
 */
export const TRANSLATION_LIST_DELIMITER = '||';

/** `"a || b||c"` -> `["a", "b", "c"]`; empty items are dropped */
export function splitTranslationList(text: string): string[] {
  return text
    .split(TRANSLATION_LIST_DELIMITER)
    .map((item) => item.trim())
    .filter(Boolean);
}
