import { LanguageTranslationKey } from '@cv/shared-util-i18n';

type AvailableLanguageCode = 'en' | 'nl' | 'fr' | 'es';

export interface LanguageCodeLabel {
  code: AvailableLanguageCode;
  labelKey: LanguageTranslationKey;
}
