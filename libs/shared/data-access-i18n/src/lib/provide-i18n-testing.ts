import { EnvironmentProviders } from '@angular/core';
import { FormatSimple, provideTolgee, Tolgee } from '@tolgee/ngx';
import en from '../i18n/en.json';

/** English translations, loaded synchronously, without storage or detection */
export function provideI18nTesting(): EnvironmentProviders {
  return provideTolgee(() =>
    Tolgee().use(FormatSimple()).init({ language: 'en', staticData: { en } })
  );
}
