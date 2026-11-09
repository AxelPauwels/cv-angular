# CV Application

## Commit messages (commitlint)

Commit messages are checked by [commitlint](https://commitlint.js.org/) using the
[`@commitlint/config-conventional`](https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional)
rules (see `commitlint.config.mjs`).

The check runs automatically on every commit through a [Husky](https://typicode.github.io/husky/)
`commit-msg` hook (`.husky/commit-msg`). Husky is installed by the `prepare` script when you run `npm install`.
A commit with an invalid message is rejected.

Messages follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4/):

```
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

Examples:

```
feat(cv): add experience section
fix: correct date formatting in timeline
docs: describe commitlint setup
```

More info:

- commitlint docs: https://commitlint.js.org/
- Conventional Commits spec: https://www.conventionalcommits.org/en/v1.0.0-beta.4/

## Translations

Tolgee, the `i18n:*` commands and how translation keys are used: see [README.translations.md](README.translations.md).

## Material Symbols icons

The app loads the Material Symbols icon font from Google Fonts in [apps/cv/src/index.html](apps/cv/src/index.html), but only the icons it uses (`icon_names=…` in the font URL). The full font is ~290 KiB and hides every icon until it has loaded, which cost Lighthouse performance points on every page. The subset is a few KiB.

The catch: an icon that is not in that list does not show up. You see the first letter of its name instead (for example a "W" for `workspace_premium`).

**When to run it**: whenever you add, rename or remove a Material icon, for example in a `<mat-icon fontSet="material-symbols-outlined">`, an `icon="…"` or `[icon]="…"` input, or an `icon: '…'` value in TypeScript:

```sh
npm run material-symbols:extract
```

It scans the templates and TypeScript for icon names (see [tools/material-symbols/material-symbols.mjs](tools/material-symbols/material-symbols.mjs) for exactly where it looks) and rewrites the font URL in `index.html`. Commit the updated `index.html` with your change.

CI checks this with `npx nx run cv:material-symbols` and fails with the missing names when you forget. If an icon still shows as a letter, its name is built in a way the script can't see (for example glued together from strings): write the full name as a quoted string, like `'workspace_premium'`, so the script finds it.

## Micro Frontends

npx nx g @nx/angular:application apps/cv-mfe1
npx nx g @angular-architects/native-federation:init --project=cv-mfe1 --port=4201 --type=remote

## Release branches

How `develop` → `release/x.y.z` → `main` works, with automatic versioning, tagging and Firebase previews: see [README.release-branches.md](README.release-branches.md).

## Publish npm packages

Before building the package add this to package.json for public packages:

```json
{
  "publishConfig": {
    "access": "public"
  }
}
```

See package.json scripts:
Make sure you are logged in to npm with `npm login` before publishing.
release (wich versions the package), publish it to npmjs.com and push the release commit and tag to github.

Usage in this or other projects: Just install with `npm install @axel-pauwels/mac-window`
