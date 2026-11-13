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

## Micro-frontends

How the `<cv-mfe>` micro-frontend is loaded, used with typed inputs, developed against a local remote, and updated when the remote ships a new version: see [README.micro-frontends.md](README.micro-frontends.md).

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
