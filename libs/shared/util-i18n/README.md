# shared-util-i18n

Pure translation helpers and types, without Angular or Tolgee.

- `TranslationKey` and the narrower `NavTranslationKey`, `HeadingTranslationKey`,
  `SubheadingTranslationKey`, `PageTitleTranslationKey`, `LanguageTranslationKey`: template
  literal types, so a component input only accepts keys of the right kind
- `splitTranslationList()` and `TRANSLATION_LIST_DELIMITER` (`||`): a translated list as an array

The languages themselves and Tolgee live in [`@cv/shared-data-access-i18n`](../data-access-i18n).

```sh
npx nx run shared-util-i18n:test
```
