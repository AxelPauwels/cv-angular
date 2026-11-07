# Translations (Tolgee)

How the texts of the app are translated, and how to keep the code, the local language files and [Tolgee](https://app.tolgee.io) (project `23075`) in sync.

## TL;DR

```bash
# Added or changed texts in the code? Find what Tolgee is missing...
npm run i18n:missing

# ...review and edit scripts/tolgee/i18n-missing-keys.json, then push only those keys
npm run i18n:push-missing -- --dry-run
npm run i18n:push-missing

# Get the latest translations from Tolgee into the language files
npm run i18n:pull

# Check the code against the local language files (read-only, fails on problems)
npm run i18n:check
```

## How it fits together

| Where                                                      | What                                                                                                                        |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Tolgee                                                     | The source of truth for every translation. Edit texts there, or in the app (see [In-context editing](#in-context-editing)). |
| `libs/shared/data-access-i18n/src/i18n/{en,nl,fr,es}.json` | The language files: pulled from Tolgee and committed. The app ships these, one lazy chunk per language.                     |
| `libs/shared/data-access-i18n/src/lib/provide-i18n.ts`     | `provideI18n()`: Tolgee for the app. Picks the saved language, else the browser language, else English.                     |
| `libs/shared/data-access-i18n/src/lib/languages.ts`        | `LANGUAGES`, `DEFAULT_LANGUAGE`, `isLanguageCode()`: the languages the app offers.                                          |
| `libs/shared/util-i18n/src/lib/languages.ts`               | The translation key types (see [Types](#types)).                                                                            |
| `scripts/tolgee/`                                          | The scripts behind `i18n:check`, `i18n:missing` and `i18n:push-missing`.                                                    |

Where the app gets its translations from:

- **Dev server (`nx serve cv`)**: from **Tolgee itself** when `apps/cv/src/tokens/environment.tokens.ts` has an API key, otherwise from the language files. So a key that is only in your local files shows up empty (or as the raw key) in dev until it is pushed.
- **Production build** (`scripts/build-production.sh`): runs `npm run i18n:pull` first when `TOLGEE_API_KEY` is set, so it ships the latest translations; without it, the committed files. The key never ends up in the build.
- **Unit tests**: `provideI18nTesting()` loads `en.json` synchronously, so specs can assert on English texts.

## Setup

Two gitignored files hold your Tolgee API key (Tolgee > top right > User settings > Project API keys):

```bash
# For the CLI (pull, push and the scripts below)
cp .tolgeerc.json.example .tolgeerc.json   # fill in "apiKey"

# For the dev server (translations from Tolgee and in-context editing)
cp apps/cv/src/tokens/environment.tokens.example.ts apps/cv/src/tokens/environment.tokens.ts
```

Or log in once instead of putting the key in `.tolgeerc.json`:

```bash
npm run i18n:login
```

## Commands

| Command                     | Does                                                                                                                                                  | Changes                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `npm run i18n:check`        | Checks the keys in the code against the local language files: missing keys, untranslated values, templates without a match. Exits with 1 on problems. | nothing                                     |
| `npm run i18n:check:unused` | The same, and lists keys no code refers to.                                                                                                           | nothing                                     |
| `npm run i18n:missing`      | Pulls Tolgee (into a temporary folder) and writes the keys it is missing to a review file.                                                            | `scripts/tolgee/i18n-missing-keys.json`     |
| `npm run i18n:push-missing` | Pushes the reviewed keys to Tolgee and adds them to the local language files. `-- --dry-run` only shows what it would push.                           | Tolgee, the language files, the review file |
| `npm run i18n:pull`         | `tolgee pull`: overwrites the local language files with Tolgee.                                                                                       | the language files                          |
| `npm run i18n:push`         | `tolgee push`: pushes **all** local language files to Tolgee (existing translations are kept).                                                        | Tolgee                                      |
| `npm run i18n:login`        | `tolgee login`: stores your API key for the CLI.                                                                                                      | your Tolgee CLI login                       |

### Adding new texts: `i18n:missing` and `i18n:push-missing`

1. Use the new keys in the code (and, if you like, add them to the local language files right away).
2. Run `npm run i18n:missing`. It pulls the latest Tolgee translations, compares them with every key in the code, and writes a key to `scripts/tolgee/i18n-missing-keys.json` when Tolgee lacks it, or has an empty value, in at least one language. Values come from your local language files where they have one, and are empty otherwise:

   ```json
   {
     "t.nav.cv-navigation": {
       "_usedIn": "libs/cv/feature-shell/src/lib/internal/cv-feature-shell/cv-feature-shell.html:1",
       "en": "CV navigation",
       "nl": "CV-navigatie",
       "fr": "",
       "es": ""
     }
   }
   ```

3. Review the file: fill in or fix the values, and delete keys you don't want. `_usedIn` is only there to help and is never pushed. Running `i18n:missing` again keeps the values you already edited.
4. Run `npm run i18n:push-missing -- --dry-run` to see what will be sent, then `npm run i18n:push-missing`:
   - only the keys in the review file are pushed, and translations that already exist in Tolgee are never overwritten;
   - empty values are skipped and stay in the review file for later;
   - the pushed values are added to the local language files too, and the review file is removed once everything is pushed.
5. Commit the language files.

The review file is gitignored: it is a scratch file between the two steps.

Dynamic keys (see [Keys in the code](#keys-in-the-code)) cannot be pushed automatically: `i18n:missing` lists the ones Tolgee has no match for, so you can add those keys in Tolgee by hand.

### `i18n:pull` and `i18n:push`: careful

- `i18n:pull` **replaces** the local language files with what Tolgee has. Keys that are only in your local files are lost, so run `i18n:missing` and `i18n:push-missing` first.
- `i18n:push` sends every key of every local file. It never overwrites an existing translation (`forceMode: KEEP` in `.tolgeerc.json`), but it does create every local-only key in Tolgee, including ones you are still working on. Prefer `i18n:push-missing` to push only what you reviewed.

### In-context editing

In a dev build with an API key, Tolgee's DevTools are on: hold <kbd>Alt</kbd> and click a text in the app to edit its translation in Tolgee directly. Pull afterwards to get the change into the language files.

## Keys in the code

Every translation key is a string starting with `t.`, in lowercase kebab-case, grouped by feature: `t.nav.cv`, `t.theme.violet`, `t.personal.about-me.card.title`. The language files nest them the same way:

```json
{ "t": { "nav": { "cv": "CV" } } }
```

Use them with Tolgee's `translate` pipe, or keep them in constants and inputs:

```html
<h1>{{ 't.heading.education' | translate }}</h1>
<button [attr.aria-label]="'t.theme.switch' | translate">…</button>
```

```ts
{ labelKey: 't.nav.cv', path: ROUTES.CV.ROOT }
```

The scripts find keys by scanning `.ts` and `.html` files under `apps/` and `libs/` (specs excluded) for string literals that start with `t.`. So keep keys literal where you can. When a key has to be built at runtime, keep the literal part in the code so the scripts can still check it:

| In the code                                      | The scripts treat it as                                                                |
| ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `'t.nav.cv'`                                     | a key                                                                                  |
| `const ABOUT_ME = 't.personal.about-me.card'`    | a key, or a group of keys used as a prefix (`${ABOUT_ME}.title`)                       |
| `` `t.tour.step.${id}.title` ``                  | a pattern: at least one key per language has to match (`t.tour.step.<anything>.title`) |
| `'t.country.' + person.contact.address.country`  | a pattern too: at least one key has to start with `t.country.`                         |
| `` type NavTranslationKey = `t.nav.${string}` `` | a TypeScript type, ignored                                                             |
| `` `${prefix}.${key}` `` without a `t.` literal  | invisible: avoid it, the scripts cannot check it                                       |

A value that is empty, or equal to its own key (e.g. `"t.temp.versions": "t.temp.versions"`), counts as untranslated.

### Types

`@cv/shared-util-i18n` has template literal types for keys, so an input or property only accepts strings from the right group:

```ts
export type TranslationKey = `t.${string}`;
export type NavTranslationKey = `t.nav.${string}`;
export type LanguageTranslationKey = `t.language.${string}`;
export type HeadingTranslationKey = `t.heading.${string}`;
export type SubheadingTranslationKey = `t.subheading.${string}`; // subheadings, categories, sections, ...
```

```ts
import { NavTranslationKey } from '@cv/shared-util-i18n';

export interface NavItem {
  labelKey: NavTranslationKey; // 't.nav.cv' compiles, 'nav.cv' or 't.heading.cv' does not
}
```

They check the shape of a key, not whether it exists: `'t.nav.typo'` still compiles. That is what `npm run i18n:check` (local files) and `npm run i18n:missing` (Tolgee) are for. Add a new type next to these when a new group of keys gets passed around through inputs.

## Adding a language

1. Add the language in Tolgee.
2. Add it to `LANGUAGES` in `libs/shared/data-access-i18n/src/lib/languages.ts`, with a `t.language.<name>` label key.
3. Add its loader to `TRANSLATIONS` in `provide-i18n.ts`.
4. Run `npm run i18n:pull` to get its language file.
