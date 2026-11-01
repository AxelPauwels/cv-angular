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

## Micro Frontends

npx nx g @nx/angular:application apps/cv-mfe1
npx nx g @angular-architects/native-federation:init --project=cv-mfe1 --port=4201 --type=remote

## Publish npm packages

before building the package add this to package.json for public packages:

```json
{
  "publishConfig": {
    "access": "public"
  }
}
```

1. log in (one time; opens the browser for npm auth/2FA)
   npm login
   npm whoami

2. check the built package.json
   cat dist/packages/<your-lib>/package.json # or wherever your dist output is

3. dry run: shows exactly which files will be uploaded
   cd dist/packages/<your-lib>
   npm publish --dry-run

4. publish
   npm publish
   (or 'npm publish --access public' if public is needed, but not set in package.json)

To install later you can just `npm install @axel-pauwels/mac-window`
