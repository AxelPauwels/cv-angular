---
name: release-flow
description: Run the develop → release/x.y.z → main release workflow with GitHub - push develop as-is and fix failing CI checks locally on develop until green, open a PR from develop into the latest open release branch for review, recommend the semver bump (patch/minor/major) from the changes since the last release and create the release branch once the user confirms, and after a release is merged into main pull main locally and merge it into develop. Use when the user asks to push develop, fix CI on develop, sync develop into the release branch, cut/create a release or asks which version to release, finish/back-merge a release, or says "run the release flow".
---

# Release flow (develop ⇄ release/x.y.z ⇄ main)

Background: [README.release.md](../../../README.release.md), [scripts/release.mjs](../../../scripts/release.mjs) and `.github/workflows/`. Short version:

- `git push` on `develop` runs `.husky/pre-push` → `node scripts/release.mjs --hook`, which asks whether to cut a release. Option **1 = "no, push as is"**. Choosing a version creates `release/x.y.z` (+ `chore(release): x.y.z` commit), pushes it, and may open a PR `release/x.y.z → main`. **Creating a release is always the user's choice, never yours.**
- Pushes to `develop`, `release/**`, `main` and every PR run **CI** (`ci.yml`). PRs other than release→main also get a **Firebase preview**. Release→main PRs get **Source branch**, **Version**, **Firebase preview** (`release.yml`).
- Merging a release PR into `main` tags it, creates the GitHub release and deploys live. After that the release branch is **done**: never PR or push into it again.

GitHub access is the `gh` CLI (already authenticated as the repo owner; repo `AxelPauwels/cv-angular`). Note: this `gh` version uses `name` (not `workflowName`) in `gh run list --json`.

## Ground rules (read first)

- **Never decide on your own when unsure. Stop and ask** (AskUserQuestion) for anything not explicitly covered below: ambiguous release branch, merge conflicts, a CI failure whose cause or fix is unclear, a fix that would touch architecture/boundaries (sheriff), weaken a test, add a dependency, or cost performance / accessibility / security (see AGENTS.md).
- **Never** pick a release version, merge any PR, push to `main` or an existing `release/*` branch, force-push, use `--no-verify`, delete branches, or rewrite pushed history. The one exception is phase **D**: once the user has said to release **and** chosen the version, you create and push that new `release/x.y.z` (its version commit uses `--no-verify`, exactly like `scripts/release.mjs`).
- Always push develop **as-is** non-interactively: `SKIP_VERSION_PROMPT=1 git push origin develop` (identical to choosing option 1; the hook still runs, it just doesn't prompt).
- Only commit fixes on `develop`, with conventional commits (commitlint runs), and with the commit attribution the session asks for. Run Nx tasks via `npx nx …` (AGENTS.md).
- Don't poll CI in a tight loop: run `gh run watch <id> --exit-status` with Bash `run_in_background: true` and wait for the notification.
- Report every PR, run and commit as a link.

## 0. Survey the state, then choose the phases

```bash
git fetch --prune --tags origin
git status -sb                                  # must be clean, and say which branch
git rev-list --left-right --count develop...origin/develop
git rev-list --left-right --count main...origin/main
git rev-list --count develop..origin/main       # >0: main has commits develop lacks (back-merge pending)
git ls-remote --heads origin 'release/*'
git tag --list '[0-9]*.[0-9]*.[0-9]*' --sort=-v:refname | head -3
gh pr list --state open --json number,title,headRefName,baseRefName,url
gh pr list --state merged --base main --limit 3 --json number,headRefName,mergedAt,url
```

Tell the user in a few lines what you found and which phases apply. Do only what the user asked for; if they said "run the release flow", run every applicable phase in this order: **C** (back-merge, if a release was merged) → **A** (push + fix CI) → **B** (PR into release branch). Phase **D** (new release) only runs when the user says they want to release; after A turns green you may ask "Release now?", but never start D on your own. If the working tree is dirty or you're not on the expected branch, ask before touching anything.

## A. Push develop as-is and fix failing checks until green

1. On `develop`, clean tree. If local is behind `origin/develop`, `git pull --no-rebase` first (conflicts → stop and ask).
2. Push: `SKIP_VERSION_PROMPT=1 git push origin develop` (skip if there's nothing to push and you're just checking CI).
3. Find the runs for the pushed commit:
   ```bash
   SHA=$(git rev-parse HEAD)
   gh run list --branch develop --limit 20 --json databaseId,name,status,conclusion,event,headSha,url \
     -q ".[] | select(.headSha == \"$SHA\")"
   ```
   (This `gh` is 2.12, which has no `--commit` flag; filter on `headSha` as above. Its `gh run view --json` has no `jobs` field either: for step progress use `gh run view <id>` to get the job id, then `gh run view --job=<job id>`.)
   (Runs can take a few seconds to appear.) Watch each in the background: `gh run watch <id> --exit-status`.
   Also check runs on open PRs whose head is `develop` (`gh pr checks <number>`), since they test the same commit.
4. All green → done with A. Otherwise, for each failed run:
   - `gh run view <id> --log-failed` (trim to the relevant error).
   - Reproduce locally with the matching Nx target, e.g. `npx nx format:check`, `npx nx run <project>:lint|test|build|typecheck`, `npx nx run cv:material-symbols`, `npx nx affected -t e2e` (e2e needs Playwright browsers).
   - If the cause and the fix are clear and in scope (format, lint, a broken test/assertion that follows from an intended change, a type error, a missing translation key): fix it, verify locally with the same Nx target, commit (`fix(...)`/`test(...)`/`style(...)`), and go back to step 2.
   - If it looks infra-related (secrets, Firebase, Nx Cloud, flaky network, GitHub outage), unclear, or the fix needs a judgment call: **stop and ask**, quoting the failing step. Don't rerun failed jobs without asking (`gh run rerun <id> --failed` is fine once the user agrees).
5. Guard: after **3** fix-and-push iterations that are still red, stop and report what you tried.

## B. PR from develop into the latest release branch (for review)

Only after phase A is green (if it isn't, ask whether to open the PR anyway).

1. **Pick the release branch**: the highest-version `release/x.y.z` on origin **whose version has no tag yet** (`git rev-parse -q --verify refs/tags/x.y.z` fails). A tagged one is already released → not a target.
   - None open → tell the user there is no open release branch and stop (don't create one on your own; if the user wants to release, that's phase D).
   - More than one untagged, or anything odd (e.g. its release→main PR was closed without merging) → ask which one.
2. Check there is something to bring in: `git log --oneline origin/release/x.y.z..origin/develop`. Empty → nothing to do, say so.
3. Existing open PR `develop → release/x.y.z`? (`gh pr list --base release/x.y.z --head develop --state open`). If yes, it already includes the push; just report it with its checks (`gh pr checks <n>`).
4. Otherwise check for conflicts before opening: `git merge-tree --write-tree origin/release/x.y.z origin/develop` (non-zero exit / conflict list → stop and ask; typical spot is `package.json`/`package-lock.json` versions).
5. Open it (never merge it, the user reviews):
   ```bash
   gh pr create --base release/x.y.z --head develop \
     --title "chore(release): bring develop into release/x.y.z" \
     --body "<bullet list of the commits from step 2, plus the attribution line the session asks for>"
   ```
6. Report: the new PR link, and the release PR `release/x.y.z → main` if one is open (`gh pr list --base main --head release/x.y.z`). Mention its checks will rerun once the user merges this PR.

## C. After a release was merged into main: update main, merge main into develop

Trigger: `gh pr list --state merged --base main` shows a `release/*` PR whose merge commit is not yet in local `develop` (`git rev-list --count develop..origin/main` > 0).

1. Verify the release on GitHub (V = the version from the merged `release/V` branch name). All must agree:
   ```bash
   git fetch --tags origin
   git rev-parse -q --verify "refs/tags/$V^{commit}"                           # tag V exists…
   gh pr view <release PR number> --json mergeCommit -q .mergeCommit.oid      # …and points at this merge commit
   gh release view "$V" --json tagName,isDraft -q '"\(.tagName) draft=\(.isDraft)"'   # GitHub release V, not a draft
   for f in package.json package-lock.json; do
     echo "$f: $(git show "origin/main:$f" | node -p "JSON.parse(require('fs').readFileSync(0)).version")"
   done                                                                        # both say V on main
   gh run list --branch main --limit 5 --json name,conclusion,headSha,url     # Release / Deploy live succeeded
   ```
   If the tag or GitHub release is missing, points elsewhere, or a version differs: **stop and report** (with the failing run's link). Don't create or move tags yourself; the tag ruleset forbids moving them, and the Tag job owns creating them. A failed **Deploy live** with a correct tag → report it (it can be redeployed via _Actions → Deploy live_); the back-merge can still go ahead once the user agrees.
2. Update main with the default (merge) strategy, local `main` only — never push it:
   ```bash
   git switch main
   git pull --no-rebase origin main
   ```
   If local `main` had its own commits and this would create a merge commit, stop and ask first.
3. Merge main into develop:
   ```bash
   git switch develop
   git pull --no-rebase origin develop
   git merge --no-edit main
   ```
   Conflicts → don't resolve or abort on your own: stop, show the conflicting files and ask how to resolve (or whether to `git merge --abort`).
4. Check `package.json` on develop now has the released version.
5. **Ask before pushing** develop. On yes, push as-is via phase A (which also watches CI).

## D. New release: recommend the semver bump, then create release/x.y.z

Only when the user says they want to release. The pre-push prompt and `npm run nx:release` need an interactive terminal, which you don't have, so you do the analysis and then the same steps as `scripts/release.mjs` yourself.

### 1. Preconditions (any miss → tell the user and ask)

- Local `develop` == `origin/develop`, clean tree, and CI on that commit is green (phase A). Note its SHA: the release is cut from exactly that commit.
- No back-merge pending (`git rev-list --count develop..origin/main` is 0); otherwise run phase C first.
- No open release yet: no `release/x.y.z` on origin without a matching tag. If there is one, ask whether to bring develop into it (phase B) instead of starting a new release.

### 2. Base version and the changes since the last release

```bash
LATEST=$(git tag --list '[0-9]*.[0-9]*.[0-9]*' --sort=-v:refname | head -1)
node -p "require('./package.json').version"     # BASE = the higher of this and $LATEST (same rule as the script)
git log --no-merges --format='%h %s%n%b' "$LATEST"..origin/develop
git diff --stat "$LATEST"..origin/develop -- . ':!packages' ':!package-lock.json'
```

Commit messages are a first hint only: read the diff of anything user-visible (routes, feature/ui libs, `libs/shared/data-access-i18n/src/i18n/*.json`, `libs/api/src/lib/schema/type-defs.graphql`, `apps/cv/src`). When a commit's type and its diff disagree (a `chore` that adds a page, a `feat` that only touches tooling), go by the diff and say so. Ignore `packages/*` (the npm packages have their own versions and releases).

### 3. Decide the recommendation

This is an app, so "breaking" means what visitors or links to the site notice, not code APIs:

| Bump      | When the changes since `$LATEST` include…                                                                                                                                                                                                                                                                          |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **major** | a `type!:` commit or `BREAKING CHANGE:` footer; a big redesign of the site; removed or renamed routes/URLs people may have linked to; a removed language; removed or renamed fields/types in `type-defs.graphql`. Never recommend major on your own judgment alone: show the evidence and let the user confirm it. |
| **minor** | a new user-visible feature: new page, section, route, component or interaction, new content (new translation keys with new text), a new GraphQL field, a new language, a new feature lib. Usually signalled by `feat` commits.                                                                                     |
| **patch** | only fixes and invisible improvements: `fix`, `perf`, `style`, `refactor`, `test`, `build`, `ci`, `docs`, `chore`, dependency updates, copy tweaks to existing text, accessibility/visual fixes of existing UI.                                                                                                    |

Highest one wins. If **nothing** user-facing changed (only `ci`/`docs`/`test`/tooling/`.claude`), say there's arguably nothing to release and ask whether to release anyway (as a patch) or wait. If it's borderline (e.g. a `feat` that's really a small tweak), say so and give both options.

### 4. Ask the user (AskUserQuestion), never pick yourself

Show: `$LATEST`, `package.json` version, the commit count, a short grouped summary (features / fixes / other) with the key commits and files that drove the decision, then options with the concrete versions computed from BASE: recommended first, marked "(Recommended)", then the other bumps; the user can type a custom `x.y.z` via "Other". Also allow "Don't release".

### 5. Create and push the branch (same as `scripts/release.mjs`)

With the chosen `V`:

```bash
# Checks: V is x.y.z, V > BASE, and the branch doesn't exist yet
git rev-parse --quiet --verify "refs/heads/release/$V"; git ls-remote --heads origin "release/$V"   # both must be empty
DIR=$(mktemp -d)
git worktree add --quiet -b "release/$V" "$DIR" <green develop SHA>
(cd "$DIR" && npm version "$V" --no-git-tag-version >/dev/null)
git -C "$DIR" add package.json package-lock.json
git -C "$DIR" commit --quiet --no-verify -m "chore(release): $V"
git worktree remove --force "$DIR"

# Verify before pushing: both files say $V, and the version commit changes nothing else
for f in package.json package-lock.json; do
  echo "$f: $(git show "release/$V:$f" | node -p "JSON.parse(require('fs').readFileSync(0)).version")"
done
git diff --name-only "release/$V~1" "release/$V"   # exactly package.json and package-lock.json

SKIP_VERSION_PROMPT=1 git push -u origin "release/$V"
```

Push only when both versions print `$V` and the commit touches exactly those two files; otherwise don't push, clean up as below and report. The **Version** check on the release PR checks the same thing again on GitHub.

Anything fails before the push → `git worktree remove --force "$DIR"` and `git branch -D "release/$V"` (it's your own unpushed branch), then report. Push fails → delete the local branch again and report. Your checked-out `develop` stays untouched.

### 6. The release PR into main

Ask whether to open it now (the script offers the same). On yes:

```bash
gh pr create --base main --head "release/$V" --title "Release $V" \
  --body "Release $V. Merging tags $V, creates the GitHub release and deploys it live."
```

Then watch its checks (**Source branch**, **Version**, **CI**, **Firebase preview**) in the background as in phase A. Failures are fixed on `develop` (phase A), then brought in with phase B. Never merge the PR: that is the user's call, and merging deploys live.

## Finish

Summarize: what was pushed (commits), CI status per run (links), the version recommendation and what the user chose, release branch and PRs opened/found (links), merges done locally, and anything waiting on the user (reviewing/merging the develop → release PR, merging the release → main PR, pushing develop).
