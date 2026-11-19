import { LanguageTranslationKey } from '@cv/shared-util-i18n';

/** ISO 639-1 codes; `nb` is Norwegian Bokmål, what browsers report for Norwegian */
type AvailableLanguageCode = 'en' | 'nl' | 'fr' | 'es' | 'nb' | 'el';

export interface LanguageCodeLabel {
  code: AvailableLanguageCode;
  labelKey: LanguageTranslationKey;
}
