import type { Language, LanguageIsoCode } from '../generated/resolvers-types';

const fallbackLanguage: Language = { isoCode: 'EN', locale: 'EN_US' };

const languages: Language[] = [
  fallbackLanguage,
  { isoCode: 'NL', locale: 'NL_BE' },
  { isoCode: 'FR', locale: 'FR_BE' },
];

export const languageRepository = {
  findAll: (): Language[] => languages,
  /** Falls back to English for a language without a locale */
  findByIsoCode: (isoCode: LanguageIsoCode): Language =>
    languages.find((language) => language.isoCode === isoCode) ??
    fallbackLanguage,
};
