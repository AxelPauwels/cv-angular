import { LanguageCodeLabel } from './internal/language.const';

export const LANGUAGES: LanguageCodeLabel[] = [
  { code: 'en', labelKey: 't.language.english' },
  { code: 'nl', labelKey: 't.language.dutch' },
  { code: 'fr', labelKey: 't.language.french' },
  { code: 'es', labelKey: 't.language.spanish' },
] as const;

export type Language = (typeof LANGUAGES)[number];
export type LanguageCode = Language['code'];

/** Used when neither a saved choice nor the browser language is available */
export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export function isLanguageCode(code: string): code is LanguageCode {
  return LANGUAGES.some((language) => language.code === code);
}
