# Publishing packages to npm

How to release the packages in `packages/*` (for example `@axel-pauwels/mac-window`) to [npmjs.com](https://www.npmjs.com/).

The apps (`apps/*`) are never released with these steps.

## TL;DR

```bash
# 1. Log in to npm (passkey in the browser)
npm login

# 2. Commit everything first, then version, changelog, commit and tag (no publish)
npx nx release --specifier=minor --skip-publish

# 3. Publish from the build output (approve with your passkey in the browser)
cd dist/packages/mac-window && npm publish && cd -

# 4. Push the release commit and tag
git push --follow-tags
```

## How releases are set up

The release config is in [`nx.json`](nx.json) under `release`:

| Setting                                         | Meaning                                                                                         |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `projects: ["packages/*"]`                      | Only packages are released, never the apps.                                                     |
| `projectsRelationship: "independent"`           | Each package has its own version (for example `mac-window@1.1.0` and `abc@3.3.8`).              |
| `releaseTag.pattern: "{projectName}@{version}"` | One git tag per package release, for example `mac-window@1.1.0`.                                |
| `projectChangelogs: true`                       | Each package gets its own `CHANGELOG.md` (for example `packages/mac-window/CHANGELOG.md`).      |
| `preVersionCommand`                             | Before versioning, checks that you are logged in to npm (`npm whoami`) and builds all packages. |

And in each package's `project.json`:

- `currentVersionResolver: "git-tag"`: the current version is read from the latest `<project>@<version>` git tag, **not** from `package.json`.
- `manifestRootsToUpdate: ["dist/{projectRoot}"]`: the new version is written to `dist/packages/<name>/package.json` only. The source `packages/<name>/package.json` keeps its old version. That's expected.
- `nx-release-publish` publishes from `dist/packages/<name>`.

## Step by step

### 1. Log in to npm

```bash
npm login
npm whoami   # should print: axel-pauwels
```

An `npm login` session token expires after about **2 hours**. Log in again just before you release, not the day before. If you forget, the `preVersionCommand` (`npm whoami`) stops the release before anything changes.

### 2. Commit your work

The changelog is built from the **commits** since the last release tag. Uncommitted changes are shipped, but are not listed in the changelog.

Use [conventional commits](https://www.conventionalcommits.org/) (`feat: ...`, `fix: ...`) so the changelog is useful.

### 3. Version, changelog, commit and tag

```bash
npx nx release --specifier=minor --skip-publish
```

Pick the specifier:

| Specifier | Use for                            | Example       |
| --------- | ---------------------------------- | ------------- |
| `patch`   | Bug fixes only                     | 1.1.0 → 1.1.1 |
| `minor`   | New features, backwards compatible | 1.1.0 → 1.2.0 |
| `major`   | Breaking changes                   | 1.1.0 → 2.0.0 |

Without `--specifier`, Nx asks for each package. Add `--projects=mac-window` to release only one package.

Try it first with `--dry-run`: this shows the new version and changelog without changing anything.

This step:

1. Runs `npm whoami` and builds the packages.
2. Writes the new version to `dist/packages/<name>/package.json`.
3. Updates `packages/<name>/CHANGELOG.md`.
4. Makes a `chore(release): publish` commit and a `<name>@<version>` tag, **locally only**.

### 4. Publish

```bash
cd dist/packages/mac-window
npm publish
cd -
```

npm asks for two-factor authentication: it opens (or prints) a URL, you approve with your **passkey** in the browser, and npm continues by itself.

**Why not `npx nx release publish`?** Nx runs `npm publish` without an interactive terminal. With passkey (web) authentication, npm only prints the login URL and quits right away. Approving in the browser after that has no effect, and Nx reports _"a valid OTP was not provided"_. Running `npm publish` yourself in the terminal makes npm wait until you have approved.

`nx release publish --otp=123456` only works with a 6-digit code from an authenticator app, not with a passkey.

Check the result:

```bash
npm view @axel-pauwels/mac-window versions
```

### 5. Push

```bash
git push --follow-tags
```

This pushes the release commit and the new `<name>@<version>` tag. The next release reads its version from that tag.

## Troubleshooting

| Error                                                                | Cause                                                                          | Fix                                                              |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| `404 Not Found - PUT https://registry.npmjs.org/@axel-pauwels%2f...` | Not logged in, or the token expired. npm answers unauthorized writes with 404. | `npm login`, then publish again (step 4).                        |
| `401 Unauthorized` from `npm whoami`                                 | Token expired.                                                                 | `npm login`.                                                     |
| `This operation requires a one-time password` (in Nx)                | Passkey login can't finish inside Nx.                                          | Publish with `npm publish` from `dist/packages/<name>` (step 4). |
| `Unable to determine the previous git tag`                           | The package has no `<name>@<version>` tag yet.                                 | See _Adding a new package_ below.                                |
| `You cannot publish over the previously published versions`          | That version is already on npm.                                                | Nothing to publish. Release a new version.                       |

### Publishing failed after step 3

The version commit and tag already exist. **Don't** run `nx release` again: it would bump the version a second time. Fix the problem (usually `npm login`) and only redo step 4 and step 5.

**Don't rebuild in between**, not even with `--dry-run`: a build copies the source `package.json` into `dist/` and resets the version there (for example back to `1.0.0`). If that happened, set the released version again before publishing:

```bash
cd dist/packages/mac-window
npm pkg set version=1.1.0   # the version from the latest <name>@<version> tag
npm publish
```

## Adding a new package

For a new package in `packages/<name>`:

1. Copy the `release` block and the `nx-release-publish` target from `packages/mac-window/project.json`.
2. Make sure `package.json` has `"publishConfig": { "access": "public" }` (needed for scoped `@axel-pauwels/...` packages).
3. **First release ever:** add `--first-release` to the `nx release` command.
4. **Already on npm, but no git tag yet:** tag the commit you published from, then release as normal:

   ```bash
   git tag -a <name>@<version> <commit> -m "<name> <version>"
   git push origin <name>@<version>
   ```

## Avoiding the login every time (optional)

- **Granular access token:** create one on npmjs.com with read and write rights for `@axel-pauwels`, and enable _Bypass 2FA_. Then `npx nx release` works in one go, publish included. These tokens expire too, and anyone who gets the token can publish, so keep it secret.
- **GitHub Actions with trusted publishing:** let CI publish with [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC). No tokens or passkeys are needed on your machine.
