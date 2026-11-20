# Axel Pauwels · CV

The CV of Axel Pauwels as an Angular application, and at the same time a showcase of how
he builds front-ends: an Nx monorepo with strict domain boundaries, a schema-first GraphQL
API, signals everywhere, six languages, and performance, accessibility and security as the
first priorities.

**Live:** <https://axel-pauwels.web.app>

## Tech stack

| Area            | Choice                                                                                  |
| --------------- | --------------------------------------------------------------------------------------- |
| Framework       | Angular 22 (standalone, signals, zoneless, OnPush by default, Signal Forms), Material 3 |
| Monorepo        | Nx 24 with Nx Cloud remote cache; boundaries enforced by Sheriff                        |
| State           | NgRx Signal Store; `graphqlResource()` for queries                                      |
| API             | Schema-first GraphQL (`libs/api`), executed in the browser, typed with GraphQL Codegen  |
| Translations    | Tolgee: English, Dutch, French, Spanish, Norwegian and Greek                            |
| Micro-frontends | Native Federation (`<cv-mfe>` from a separate repository)                               |
| AI              | Firebase AI Logic (Gemini) with App Check, through Hashbrown                            |
| Tests           | Vitest in the browser (unit), Playwright in Chromium, Firefox and WebKit (e2e)          |
| Quality         | ESLint, Stylelint, Prettier, commitlint and Husky hooks                                 |
| Hosting         | Firebase Hosting, deployed by GitHub Actions on release                                 |

## Quick start

Node version: see [`.nvmrc`](.nvmrc).

```bash
npm install
cp apps/cv/src/tokens/environment.tokens.example.ts apps/cv/src/tokens/environment.tokens.ts
npm run start:cv
```

The dev server runs on <http://localhost:4201>. The tokens file holds your local keys
(Tolgee, Web3Forms, Firebase) and is gitignored; empty values work, the related features
then say they are switched off.

| Command                              | What                                           |
| ------------------------------------ | ---------------------------------------------- |
| `npm test`                           | every unit test                                |
| `npm run e2e`                        | every end-to-end test, then opens the report   |
| `npm run lint` / `npm run stylelint` | ESLint / Stylelint                             |
| `npm run prettier`                   | formatting check (`prettier:fix` to fix)       |
| `npm run sheriff:verify`             | the architecture rules                         |
| `npm run i18n:check`                 | every translation key exists in every language |
| `npm run codegen`                    | regenerate GraphQL types after a schema change |
| `npm run build:production`           | the full release build                         |

Run single projects through Nx: `npx nx run <project>:<target>`, for example
`npx nx run cv-feature-skills:test`.

## Architecture

```
apps/cv              the app: shell, routes, global styles          → apps/cv/README.md
apps/cv-e2e          Playwright tests                               → apps/cv-e2e/README.md
libs/api             GraphQL schema, resolvers, in-memory data      → libs/api/README.md
libs/cv/*            the CV pages and their data
libs/showcase/*      showcase pages (micro-frontends, Lighthouse, AI assistant, ...)
libs/technical/*     technical pages (architecture, foundations, reports, versions)
libs/shared/*        used by every domain: layout, UI kit, i18n, routing, services
packages/mac-window  a published npm package                        → packages/mac-window/README.md
```

Libraries are named `libs/<domain>/<layer>-<name>`. A domain only depends on itself and
`shared`; layers only depend downwards:

| Layer         | Holds                                         | May use                                       |
| ------------- | --------------------------------------------- | --------------------------------------------- |
| `feature`     | pages, routes, smart components               | `feature`, `ui`, `data-access`, `api`, `util` |
| `ui`          | presentational components (inputs/outputs)    | `ui`, `util`                                  |
| `data-access` | stores, services, GraphQL operations, mappers | `data-access`, `api`, `util`                  |
| `util`        | pure functions and types                      | `util`                                        |

Each library's public API is its `src/index.ts`; anything in an `internal/` folder is private.
[`sheriff.config.ts`](sheriff.config.ts) enforces all of this in ESLint and CI. Every library
has its own README explaining what it exports.

Data flows schema-first: [`type-defs.graphql`](libs/api/src/lib/schema/type-defs.graphql) →
each data-access library's own operations and generated (private) types → a mapper → hand-written
frontend types. Features never see API types.

## Documentation

| README                                                         | About                                                                |
| -------------------------------------------------------------- | -------------------------------------------------------------------- |
| [README.translations.md](README.translations.md)               | Tolgee, translation keys and the `i18n:*` commands                   |
| [README.icons.md](README.icons.md)                             | Material Symbols (subset font) and the Icomoon icon font             |
| [README.feature-toggles.md](README.feature-toggles.md)         | switching features and menu items on or off, and their defaults      |
| [README.micro-frontends.md](README.micro-frontends.md)         | loading, typing and updating the `<cv-mfe>` remote                   |
| [README.console-cloud.md](README.console-cloud.md)             | Firebase and Google Cloud setup of the AI assistant                  |
| [README.release.md](README.release.md)                         | branches, versions, tags, checks and deploys in detail               |
| [README.release-by-skills.md](README.release-by-skills.md)     | running the release flow with Claude Code                            |
| [README.publish-npm-package.md](README.publish-npm-package.md) | versioning and publishing `packages/*` to npm                        |
| [apps/cv/README.md](apps/cv/README.md)                         | the app: structure, performance, SEO, run and build                  |
| [apps/cv-e2e/README.md](apps/cv-e2e/README.md)                 | the end-to-end tests                                                 |
| [libs/api/README.md](libs/api/README.md)                       | the GraphQL server and codegen                                       |
| `libs/<domain>/<lib>/README.md`                                | what each library exports and how to use it                          |
| [AGENTS.md](AGENTS.md)                                         | priorities and rules for AI coding agents (also read by Claude Code) |

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

## Releasing the app

`npm run nx:release` (or the question on `git push`) asks whether to release and how (patch, minor, major), then creates and pushes `release/x.y.z` with its version commit. The PR `release/x.y.z` → `main` must pass its checks and gets a Firebase preview; merging it tags `x.y.z`, creates a GitHub release and deploys live. `main` only accepts such release PRs.

### Doing a release

On `develop`, with everything for the release merged and pushed:

```bash
npm run nx:release
```

Choose the version. For example, with `1.1.0` as the latest release:

| Choice   | New version | When                                |
| -------- | ----------- | ----------------------------------- |
| 2) patch | `1.1.1`     | Only fixes (also CI, docs, tooling) |
| 3) minor | `1.2.0`     | New, backwards-compatible features  |
| 4) major | `2.0.0`     | Breaking changes or a big redesign  |

Choosing patch, the script creates and pushes `release/1.1.1` (`develop` plus the commit `chore(release): 1.1.1`) and offers to open the PR into `main` (with [`gh`](https://cli.github.com/)). Then:

1. Wait for the PR's required checks (**Source branch**, **Version** and **main**) to pass; **Firebase preview** posts a preview link.
2. Merge the PR with **Create a merge commit**. CI tags `1.1.1`, creates the GitHub release and deploys live (`deploy-live.yml`).
3. Bring `main` back into `develop`:

   ```bash
   git switch develop && git pull
   git merge origin/main
   git push
   ```

A release branch is done once its PR is merged: don't push to it again. New work goes to `develop` and out with the next release.

How it works in detail (versions, branches, workflows, hotfixes, troubleshooting): see [README.release.md](README.release.md). One version everywhere: the release tag, `package.json` and the GitHub release are always the same (`1.2.0`).

## Firebase hosting

Deploys are automatic; you normally don't run any Firebase command yourself.

| What                  | When                                                                    | How                                                                    |
| --------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Preview channel       | Every pull request                                                      | `firebase-hosting-pull-request.yml`, `release.yml`                     |
| **Live** (production) | **Only** when a `release/x.y.z` PR is merged into `main`, after the tag | `release.yml` → [`deploy-live.yml`](.github/workflows/deploy-live.yml) |
| Redeploy / roll back  | By hand, for an existing release tag                                    | _Actions → Deploy live → Run workflow_, enter the tag (e.g. `1.0.0`)   |

Other pushes or merges into `main` are checked by CI but never deployed live. See [README.release.md](README.release.md).

### Local commands

| Script                            | Command                                       | Use                                                                  |
| --------------------------------- | --------------------------------------------- | -------------------------------------------------------------------- |
| `npm run firebase:login`          | `npx firebase login`                          | Log in (`npx firebase login --reauth` when the session expired).     |
| `npm run firebase:link-project`   | `npx firebase use --add`                      | Link the local checkout to a Firebase project (`.firebaserc`).       |
| `npm run firebase:deploy-preview` | `npx firebase hosting:channel:deploy preview` | Deploy your local build to the `preview` channel (never live).       |
| `npm run firebase:emulate`        | `npx firebase emulators:start --only hosting` | Serve `dist/apps/cv/browser` locally with the `firebase.json` rules. |

Build first (`npm run build:production`) before a preview deploy or the emulator.

The Firebase CLI writes `firebase-debug.log` (and emulator logs) to the repository root. They can contain access tokens, so they are in `.gitignore`; never commit them.

### Removed commands: avoid them

These used to be npm scripts. They are removed because they bypass or undo the automatic flow; they are listed here only so you know them.

| Command                              | Why not                                                                                                                                                                                                                                                                    |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npx firebase deploy --only hosting` | Deploys **your local build live**, without a release, tag, review or CI. Use _Deploy live → Run workflow_ with a release tag instead; only in an emergency (GitHub Actions down) build a checked-out release tag and run this.                                             |
| `npx firebase init hosting:github`   | Regenerates the GitHub workflows and the service-account secret. It would bring back a workflow that deploys every push to `main` live and overwrite the PR preview workflow. Only needed when the Firebase service account must be recreated; review the diff afterwards. |

## Publishing npm packages

The packages in `packages/*` (for example `@axel-pauwels/mac-window`) are versioned and published to npm separately from the app, each with its own version and tags (`mac-window@1.2.0`): `npm run package:login`, `npm run package:release`, `npm run package:publish:<name>`, `npm run package:push-tags`. See [README.publish-npm-package.md](README.publish-npm-package.md).

Usage in this or other projects: Just install with `npm install @axel-pauwels/mac-window`
