# Release branches

How the CV app goes from `develop` to production, and how it gets its version and git tag.

The npm packages in `packages/*` have their own release flow: see [README.publish.md](README.publish.md).

## TL;DR

```bash
# 1. Cut a release branch from develop; its name is the version
git switch develop && git pull
git switch -c release/1.0.0
git push -u origin release/1.0.0

# 2. Open a PR release/1.0.0 → main on GitHub
#    CI sets package.json to 1.0.0, commits it to release/1.0.0 and deploys a Firebase preview

# 3. Merge the PR (with a merge commit)
#    CI tags the merge commit 1.0.0, creates a GitHub release and deploys to production

# 4. Bring main back into develop
git switch develop && git pull
git merge origin/main
git push
```

## Branches

| Branch          | What it is                                   | Created from          | Merged into         |
| --------------- | -------------------------------------------- | --------------------- | ------------------- |
| `develop`       | Day-to-day work                              | –                     | `release/*`         |
| `release/x.y.z` | One release; its name is the version         | `develop` (or `main`) | `main`              |
| `main`          | What runs in production; every merge is live | –                     | back into `develop` |

The version follows [semantic versioning](https://semver.org/): `major.minor.patch`. The branch name must be exactly `release/<major>.<minor>.<patch>`, for example `release/1.0.0`, `release/1.0.1` or `release/3.4.0`. No `v` prefix and no suffixes such as `-rc`.

| Change since the last release      | Example       |
| ---------------------------------- | ------------- |
| Bug fixes only                     | 1.0.0 → 1.0.1 |
| New features, backwards compatible | 1.0.1 → 1.1.0 |
| Breaking changes or a big redesign | 1.1.0 → 2.0.0 |

## What runs where

| Event                                       | Workflow                                                                                   | What it does                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Push to `develop`, `release/**` or `main`   | [`ci.yml`](.github/workflows/ci.yml)                                                       | Format check, lint, test, build, typecheck and e2e of the affected projects.    |
| Any pull request                            | [`ci.yml`](.github/workflows/ci.yml)                                                       | Same checks.                                                                    |
| PR `develop` → `release/*` (or any other)   | [`firebase-hosting-pull-request.yml`](.github/workflows/firebase-hosting-pull-request.yml) | Firebase preview channel, link posted on the PR.                                |
| PR `release/x.y.z` → `main`, opened/updated | [`release.yml`](.github/workflows/release.yml) → **Version**                               | Checks the version, sets it in `package.json`, commits `chore(release): x.y.z`. |
| PR `release/x.y.z` → `main`, opened/updated | [`release.yml`](.github/workflows/release.yml) → **Firebase preview**                      | Builds the version commit and deploys it to a preview channel.                  |
| PR `release/x.y.z` → `main`, merged         | [`release.yml`](.github/workflows/release.yml) → **Tag and GitHub release**                | Tags the merge commit `x.y.z` and creates a GitHub release with notes.          |
| Push to `main` (the merge)                  | [`firebase-hosting-merge.yml`](.github/workflows/firebase-hosting-merge.yml)               | Production build and deploy to the live channel.                                |

### Why the tag is made on merge, not when the PR is opened

The version is set as soon as the PR is opened, so the preview shows exactly what will be released. The **tag** waits until the merge because:

- a tag must point at the code that actually went live; fixes pushed to the release branch after opening the PR would otherwise not be in the tagged commit;
- a PR that is closed without merging would leave a tag for a release that never happened;
- tags are hard to move once someone has fetched them.

### Checks done by the Version job

The job fails, with a message on the PR, when:

- the branch name is not `release/<major>.<minor>.<patch>`;
- a tag with that version already exists;
- the version is not higher than the latest release tag (for example `release/1.0.0` after `1.2.0`).

Fix it by renaming the branch (create a new branch with the right name and open a new PR) and closing the old PR.

Tags of the npm packages (`mac-window@1.2.0`) are ignored: app releases use plain version tags (`1.0.0`).

## Step by step

### 1. Cut the release branch

```bash
git switch develop
git pull
git switch -c release/1.0.0
git push -u origin release/1.0.0
```

CI runs on every push to the release branch. From now on, only fixes for this release go on the release branch; new features keep going to `develop` and wait for the next release.

To get later work from `develop` into the release, open a PR `develop` → `release/1.0.0`. That PR gets its own Firebase preview.

### 2. Open the release PR

Open a pull request from `release/1.0.0` into `main`. Within a minute, the **Release / Version** job:

1. reads `1.0.0` from the branch name;
2. checks that the version is new and higher than the latest release;
3. runs `npm version 1.0.0 --no-git-tag-version` (updates `package.json` and `package-lock.json`);
4. commits `chore(release): 1.0.0` as `github-actions[bot]` and pushes it to `release/1.0.0`.

Then **Release / Firebase preview** builds that commit and posts the preview link on the PR.

Pushing more fixes to the release branch reruns both jobs. The version commit is only made once; after that the job sees `package.json` is already right and only the preview is redeployed.

Run `git pull` on your local release branch before pushing again, because the bot added a commit.

### 3. Merge

Merge with **Create a merge commit** (not squash or rebase). That keeps `main` and `develop` sharing the same commits, so the back-merge in step 4 stays clean.

After the merge:

- **Release / Tag and GitHub release** tags the merge commit on `main` as `1.0.0` and creates a GitHub release (the _Releases_ page of the repository) with notes generated from the merged PRs;
- **Deploy to Firebase Hosting on merge** builds `main` and deploys it live.

You can delete the release branch afterwards; the tag keeps the version.

### 4. Back-merge main into develop

`main` now has the version commit and the merge commit that `develop` doesn't have. Bring them back so `develop` shows the released version and the next release PR has no conflicts:

```bash
git switch develop
git pull
git merge origin/main
git push
```

Or open a PR `main` → `develop` on GitHub.

## Hotfixes

A fix that can't wait for the next release from `develop`:

```bash
git switch main
git pull
git switch -c release/1.0.1
# fix, commit, push
git push -u origin release/1.0.1
```

Then follow steps 2 to 4 as for a normal release. The back-merge (step 4) brings the fix into `develop`.

## One-time repository setup

### Required

- **Actions permissions**: _Settings → Actions → General → Workflow permissions_: the workflows ask for `contents: write` themselves, but this setting must not block it. Choose _Read and write permissions_ if the Version or Tag job fails with `403`.
- **Secrets** already used by the deploys: `FIREBASE_SERVICE_ACCOUNT_AXEL_PAUWELS` and `TOLGEE_API_KEY`.

### Recommended

- **Branch protection on `main`** (_Settings → Rules → Rulesets_): require a pull request, require the `CI` and `Release / Version` checks, and block force pushes and deletion.
- **Tag protection**: a ruleset for tags matching `*.*.*` so release tags can't be moved or deleted by accident.
- **Branch protection on `release/**`**: block force pushes, so the bot's version commit can't be overwritten.

### Optional: `RELEASE_TOKEN`

A push made with the default `GITHUB_TOKEN` [doesn't start new workflow runs](https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication#using-the-github_token-in-a-workflow). So after the bot's version commit, `CI` is not run again on that commit. With **required status checks** on `main`, the PR then waits for checks that never come.

If that happens, add a repository secret `RELEASE_TOKEN`: a [fine-grained personal access token](https://github.com/settings/personal-access-tokens/new) for this repository only, with **Contents: Read and write**, and a short expiry date. The Version job uses it automatically when it exists. Its push then starts `CI` and `Release` again on the version commit (the running Release run is cancelled, so the preview is deployed once).

Without required checks you don't need it: the version commit only changes `package.json` and `package-lock.json`, and the preview build still runs the unit and e2e tests.

## Troubleshooting

| Problem                                                          | Cause                                                   | Fix                                                                                                   |
| ---------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `Branch '...' must be named release/<major>.<minor>.<patch>`     | Branch name like `release/1.0` or `release/v1.0.0`.     | Push the same commits to `release/1.0.0`, open a new PR, close the old one.                           |
| `Tag x.y.z already exists`                                       | That version was released before.                       | Use the next version.                                                                                 |
| `Version x.y.z must be higher than the latest release`           | A lower version than the last tag.                      | Use a higher version.                                                                                 |
| `failed to push some refs` in the Version job                    | Someone pushed to the release branch while the job ran. | Nothing: that push starts a new run, which commits the version.                                       |
| `rejected ... (fetch first)` when you push to the release branch | The bot added the version commit.                       | `git pull`, then push.                                                                                |
| PR waits for checks after the version commit                     | Required checks and no `RELEASE_TOKEN`.                 | Add `RELEASE_TOKEN` (see above), or push any commit to the release branch yourself.                   |
| Warning `package.json on main is ..., not x.y.z` on the Tag job  | The PR was merged before the Version job had finished.  | The tag is still made. Fix the version with a PR to `main`, or require the `Release / Version` check. |
| No preview on the release PR                                     | The Version job failed, or the PR comes from a fork.    | Fix the Version job error; release branches must live in this repository.                             |
