# Publishing npm packages

How the packages in `packages/*` (for example [`@axel-pauwels/mac-window`](https://www.npmjs.com/package/@axel-pauwels/mac-window)) get a new version, a changelog and a git tag, and are published to [npmjs.com](https://www.npmjs.com/). It all runs on your machine with [Nx release](https://nx.dev/features/manage-releases); nothing is deployed.

This is separate from releasing the CV app (`develop` → `release/x.y.z` → `main`, deployed to Firebase): see [README.release.md](README.release.md). The apps (`apps/*`) are never published to npm, and the packages are never deployed.

## TL;DR

```bash
# 1. Log in to npm (passkey in the browser); a session lasts about 2 hours
npm run package:login

# 2. Commit everything first, then version, changelog, commit and tag (no publish)
npm run package:release -- --specifier=minor

# 3. Publish from the build output (approve with your passkey in the browser)
npm run package:publish:mac-window

# 4. Push the release commit and tag (answer "1) no" to the app release question)
npm run package:push-tags
```

## Versions: what a release changes

Each package has **its own version**, independent of the app and of the other packages:

| Where                                   | Set by                                    | After releasing `mac-window` `1.2.0`                  |
| --------------------------------------- | ----------------------------------------- | ----------------------------------------------------- |
| Git tag                                 | `npm run package:release` (step 3)        | `mac-window@1.2.0`                                    |
| `dist/packages/<name>/package.json`     | `npm run package:release` (step 3)        | `"version": "1.2.0"`                                  |
| `packages/<name>/CHANGELOG.md`          | `npm run package:release` (step 3)        | a `## 1.2.0` section with the commits since `1.1.0`   |
| npm registry                            | `npm run package:publish:<name>` (step 4) | `npm view @axel-pauwels/mac-window version` → `1.2.0` |
| `packages/<name>/package.json` (source) | **not changed**                           | keeps its old version, for example `1.0.0`            |

**The git tag is the source of truth**, not `package.json`: Nx reads the current version from the latest `<name>@<version>` tag (`currentVersionResolver: "git-tag"`) and writes the new one only to the build output in `dist/`. That the source `package.json` keeps an old version is expected; don't fix it by hand.

**Not the same as the app version**, on purpose: the app is tagged `1.2.0`, a package `mac-window@1.2.0`. A package version tells the people who install it what changed for them (semver), which has nothing to do with the app's releases. The app release prompt and the app's CI ignore package tags.

## Choosing the version

`npm run package:release` without options asks for each package. Or choose up front:

```bash
npm run package:release -- --specifier=minor
npm run package:release -- --specifier=patch --projects=mac-window
```

| Change since the last release      | Specifier | Example       |
| ---------------------------------- | --------- | ------------- |
| Bug fixes only                     | `patch`   | 1.1.0 → 1.1.1 |
| New features, backwards compatible | `minor`   | 1.1.0 → 1.2.0 |
| Breaking changes                   | `major`   | 1.1.0 → 2.0.0 |

Try it first with `--dry-run`: it shows the new version and changelog without changing anything.

The changelog is built from the **commits** since the package's last tag, so use [conventional commits](https://www.conventionalcommits.org/) (`feat: ...`, `fix: ...`).

## What runs where

Everything runs locally; no workflow publishes or deploys a package.

| Command                                   | What it does                                                                                                                                               |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run package:login`                   | `npm login`: opens the browser to log in with your passkey.                                                                                                |
| `npm run package:release`                 | `nx release --skip-publish`: checks the login (`npm whoami`), builds the packages, sets the version, writes the changelog, commits and tags. Locally only. |
| `npm run package:publish:mac-window`      | `npm publish dist/packages/mac-window`: publishes the built package. Asks for your passkey.                                                                |
| `npm run package:push-tags`               | `git push --follow-tags`: pushes the release commit and the new tag.                                                                                       |
| Push to `develop`, `release/**` or `main` | [`ci.yml`](.github/workflows/ci.yml) checks the packages like every other project (lint, test, build). It does not publish.                                |

The release config is in [`nx.json`](nx.json) under `release`:

| Setting                                         | Meaning                                                                                         |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `projects: ["packages/*"]`                      | Only packages are released, never the apps.                                                     |
| `projectsRelationship: "independent"`           | Each package has its own version (for example `mac-window@1.1.0` and `abc@3.3.8`).              |
| `releaseTag.pattern: "{projectName}@{version}"` | One git tag per package release, for example `mac-window@1.1.0`.                                |
| `projectChangelogs: true`                       | Each package gets its own `CHANGELOG.md` (for example `packages/mac-window/CHANGELOG.md`).      |
| `preVersionCommand`                             | Before versioning, checks that you are logged in to npm (`npm whoami`) and builds all packages. |

And in each package's `project.json`:

- `currentVersionResolver: "git-tag"`: the current version comes from the latest `<name>@<version>` tag.
- `manifestRootsToUpdate: ["dist/{projectRoot}"]`: the new version is written to `dist/packages/<name>/package.json` only.
- `nx-release-publish` publishes from `dist/packages/<name>`.

## Step by step

### 1. Log in to npm

```bash
npm run package:login
npm whoami   # should print: axel-pauwels
```

An npm login session expires after about **2 hours**. Log in just before you release, not the day before. If you forget, step 3 stops at `npm whoami` before anything changes.

### 2. Commit your work

On `develop`, commit everything that should be in the release. Uncommitted changes are built and published, but are not listed in the changelog.

### 3. Version, changelog, commit and tag

```bash
npm run package:release -- --specifier=minor
```

This:

1. runs `npm whoami` and builds the packages;
2. writes the new version to `dist/packages/<name>/package.json`;
3. updates `packages/<name>/CHANGELOG.md`;
4. makes a `chore(release): publish` commit and a `<name>@<version>` tag, **locally only**.

### 4. Publish

```bash
npm run package:publish:mac-window
```

npm asks for two-factor authentication: it opens (or prints) a URL, you approve with your **passkey** in the browser, and npm continues by itself.

**Why not `npx nx release publish`?** Nx runs `npm publish` without an interactive terminal. With passkey (web) authentication, npm only prints the login URL and quits right away. Approving in the browser after that has no effect, and Nx reports _"a valid OTP was not provided"_. Running `npm publish` yourself makes npm wait until you have approved. (`nx release publish --otp=123456` only works with a 6-digit code from an authenticator app, not with a passkey.)

Check the result:

```bash
npm view @axel-pauwels/mac-window versions
```

### 5. Push

```bash
npm run package:push-tags
```

This pushes the release commit and the `<name>@<version>` tag; the next package release reads its version from that tag. Pushing `develop` triggers the app release question: answer **1) no** (or push with `SKIP_VERSION_PROMPT=1`), unless you also want to release the app. The commit reaches `main` with the next app release, like any other work on `develop`.

## Adding a new package

For a new package in `packages/<name>`:

1. Copy the `release` block and the `nx-release-publish` target from `packages/mac-window/project.json`.
2. Make sure `package.json` has `"publishConfig": { "access": "public" }` (needed for scoped `@axel-pauwels/...` packages).
3. Add a `package:publish:<name>` script to the root `package.json`, like `package:publish:mac-window`.
4. **First release ever:** add `--first-release` to the release command (`npm run package:release -- --first-release`).
5. **Already on npm, but no git tag yet:** tag the commit you published from, then release as normal:

   ```bash
   git tag -a <name>@<version> <commit> -m "<name> <version>"
   git push origin <name>@<version>
   ```

## One-time setup

- **npm account** `axel-pauwels` with access to the `@axel-pauwels` scope, and a passkey for two-factor authentication.
- **Ruleset** `release tags` (_Settings → Rules → Rulesets_, tags `*.*.*`): also covers package tags such as `mac-window@1.2.0`, so a published version's tag can't be moved or deleted. Creating tags is allowed. See [README.release.md](README.release.md#one-time-repository-setup).

### Avoiding the login every time (optional)

- **Granular access token:** create one on npmjs.com with read and write rights for `@axel-pauwels`, and enable _Bypass 2FA_. Then `npx nx release` works in one go, publish included. These tokens expire too, and anyone who gets the token can publish, so keep it secret.
- **GitHub Actions with trusted publishing:** let CI publish with [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC). No tokens or passkeys are needed on your machine.

## Troubleshooting

| Problem                                                              | Cause                                                                            | Fix                                                     |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `404 Not Found - PUT https://registry.npmjs.org/@axel-pauwels%2f...` | Not logged in, or the session expired. npm answers unauthorized writes with 404. | `npm run package:login`, then publish again (step 4).   |
| `401 Unauthorized` from `npm whoami`                                 | Session expired.                                                                 | `npm run package:login`.                                |
| `This operation requires a one-time password` (in Nx)                | Passkey login can't finish inside Nx.                                            | Publish with `npm run package:publish:<name>` (step 4). |
| `Unable to determine the previous git tag`                           | The package has no `<name>@<version>` tag yet.                                   | See [Adding a new package](#adding-a-new-package).      |
| `You cannot publish over the previously published versions`          | That version is already on npm.                                                  | Nothing to publish. Release a new version.              |
| The source `package.json` shows an old version                       | Expected: only `dist/` gets the new version; the tag is the source of truth.     | Nothing to do.                                          |

### Publishing failed after step 3

The version commit and tag already exist. **Don't** run `npm run package:release` again: it would bump the version a second time. Fix the problem (usually the login) and only redo step 4 and step 5.

**Don't rebuild in between**, not even with `--dry-run`: a build copies the source `package.json` into `dist/` and resets the version there (for example back to `1.0.0`). If that happened, set the released version again before publishing:

```bash
cd dist/packages/mac-window
npm pkg set version=1.2.0   # the version from the latest <name>@<version> tag
npm publish
cd -
```
