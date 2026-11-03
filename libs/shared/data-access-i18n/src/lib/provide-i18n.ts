import { EnvironmentProviders, isDevMode } from '@angular/core';
import {
  DevTools,
  FormatSimple,
  LanguageDetector,
  LanguageStorage,
  provideTolgee,
  Tolgee,
  TreeTranslationsData,
} from '@tolgee/ngx';
import { DEFAULT_LANGUAGE, LANGUAGES, LanguageCode } from './languages';

/**
 * Translation files are pulled from Tolgee (`npm run i18n:pull`) and committed;
 * each language is its own lazy chunk, so only the active one is downloaded.
 */
const TRANSLATIONS: Record<LanguageCode, () => Promise<TreeTranslationsData>> =
  {
    en: () => import('../i18n/en.json').then((m) => m.default),
    nl: () => import('../i18n/nl.json').then((m) => m.default),
    fr: () => import('../i18n/fr.json').then((m) => m.default),
    es: () => import('../i18n/es.json').then((m) => m.default),
  };

/**
 * Tolgee for the app: the saved language, else the browser language, else
 * English. In dev builds, DevTools enable in-context editing (Alt + click a
 * text) once the Tolgee browser extension provides an API key; no key is
 * ever part of the app.
 */
export function provideI18n(): EnvironmentProviders {
  return provideTolgee(() => {
    const tolgee = Tolgee()
      .use(FormatSimple())
      .use(LanguageStorage())
      .use(LanguageDetector());

    if (isDevMode()) {
      tolgee.use(DevTools());
    }

    return tolgee.init({
      availableLanguages: LANGUAGES.map((language) => language.code),
      defaultLanguage: DEFAULT_LANGUAGE,
      fallbackLanguage: DEFAULT_LANGUAGE,
      staticData: TRANSLATIONS,
    });
  });
}
