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
