---
name: release-flow
description: Run the develop → release/x.y.z → main release workflow with GitHub - push develop as-is and fix failing CI checks locally on develop until green, open a PR from develop into the latest open release branch for review, and after a release is merged into main pull main locally and merge it into develop. Use when the user asks to push develop, fix CI on develop, sync develop into the release branch, finish/back-merge a release, or says "run the release flow".
---

# Release flow (develop ⇄ release/x.y.z ⇄ main)

Background: [README.release.md](../../../README.release.md), [scripts/release.mjs](../../../scripts/release.mjs) and `.github/workflows/`. Short version:

- `git push` on `develop` runs `.husky/pre-push` → `node scripts/release.mjs --hook`, which asks whether to cut a release. Option **1 = "no, push as is"**. Choosing a version creates `release/x.y.z` (+ `chore(release): x.y.z` commit), pushes it, and may open a PR `release/x.y.z → main`. **Creating a release is always the user's choice, never yours.**
- Pushes to `develop`, `release/**`, `main` and every PR run **CI** (`ci.yml`). PRs other than release→main also get a **Firebase preview**. Release→main PRs get **Source branch**, **Version**, **Firebase preview** (`release.yml`).
- Merging a release PR into `main` tags it, creates the GitHub release and deploys live. After that the release branch is **done**: never PR or push into it again.

GitHub access is the `gh` CLI (already authenticated as the repo owner; repo `AxelPauwels/cv-angular`). Note: this `gh` version uses `name` (not `workflowName`) in `gh run list --json`.

## Ground rules (read first)

- **Never decide on your own when unsure. Stop and ask** (AskUserQuestion) for anything not explicitly covered below: ambiguous release branch, merge conflicts, a CI failure whose cause or fix is unclear, a fix that would touch architecture/boundaries (sheriff), weaken a test, add a dependency, or cost performance / accessibility / security (see AGENTS.md).
- **Never** pick a release version, create a release branch, merge any PR, push to `main` or a `release/*` branch, force-push, use `--no-verify`, delete branches, or rewrite pushed history.
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

Tell the user in a few lines what you found and which phases apply. Do only what the user asked for; if they said "run the release flow", run every applicable phase in this order: **C** (back-merge, if a release was merged) → **A** (push + fix CI) → **B** (PR into release branch). If the working tree is dirty or you're not on the expected branch, ask before touching anything.

## A. Push develop as-is and fix failing checks until green

1. On `develop`, clean tree. If local is behind `origin/develop`, `git pull --no-rebase` first (conflicts → stop and ask).
2. Push: `SKIP_VERSION_PROMPT=1 git push origin develop` (skip if there's nothing to push and you're just checking CI).
3. Find the runs for the pushed commit:
   ```bash
   SHA=$(git rev-parse HEAD)
   gh run list --branch develop --limit 20 --json databaseId,name,status,conclusion,event,headSha,url \
     -q ".[] | select(.headSha == \"$SHA\")"
   ```
   (This `gh` is 2.12, which has no `--commit` flag; filter on `headSha` as above.)
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
   - None open → tell the user there is no open release branch and stop (don't create one; that's the push prompt's job, the user's choice).
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

1. Optionally confirm the release finished on GitHub: `gh run list --branch main --limit 5` / `gh release view x.y.z`. A failed Tag or Deploy job → report it, but the back-merge can still go ahead.
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

## Finish

Summarize: what was pushed (commits), CI status per run (links), PRs opened/found (links), merges done locally, and anything waiting on the user (reviewing/merging the develop → release PR, merging the release → main PR, pushing develop).
