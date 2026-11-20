# shared-data-access-i18n

Translations with [Tolgee](https://tolgee.io): setup, the supported languages and the active language.

- `provideI18n(devOptions?)`: registers Tolgee with the static translations in
  `src/i18n/*.json` (the in-context editor only in development, with your local key)
- `LANGUAGES`, `DEFAULT_LANGUAGE`, `isLanguageCode()`: the six supported languages
- `LanguageService`: the active language as a signal, and switching it
- `provideI18nTesting()`: English translations for unit tests

Keys, the `i18n:*` scripts and the Tolgee workflow: see
[README.translations.md](../../../README.translations.md).

```sh
npx nx run shared-data-access-i18n:test
```
