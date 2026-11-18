# Releasing with Claude Code (`release-flow` skill)

The [`release-flow`](.claude/skills/release-flow/SKILL.md) skill lets Claude Code run the release workflow from [README.release.md](README.release.md) for you: push `develop`, fix failing CI, pick the version, create the release branch, open the pull requests and back-merge `main` after a release. Read that README for how the branches, checks and deploys work; this one is about driving it through Claude.

**You stay in charge of every decision.** Claude never chooses a version, never merges a pull request, never pushes to `main`, and stops to ask whenever it's not sure (merge conflicts, an unclear CI failure, a fix that would weaken a test or cost performance, accessibility or security).

## Prerequisites

- [Claude Code](https://claude.com/claude-code) opened in this repository (CLI, desktop app or IDE extension). The skill lives in `.claude/skills/`, so it's picked up automatically.
- The [GitHub CLI](https://cli.github.com/) logged in with access to `AxelPauwels/cv-angular`:

  ```bash
  gh auth status
  ```

  If you're not logged in, run `gh auth login`. No MCP server or token in the repo is needed.

- A clean working tree on `develop` (Claude asks before touching anything otherwise).

## Starting the skill

Ask in plain words, or type `/release-flow`. Claude first checks the state (branches, tags, open and merged PRs, CI) and tells you which steps apply before doing anything.

| You say                                       | What Claude does                                                                                                       |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| "push develop"                                | **A.** Pushes `develop` as-is (option 1 of the push prompt) and watches CI; fixes failures on `develop` until green.   |
| "is CI green?" / "fix CI on develop"          | **A.** Checks the CI run of the latest `develop` commit and fixes it if it failed.                                     |
| "release" / "which version should I release?" | **D.** Recommends patch, minor or major from the changes since the last release, asks you, then creates the branch.    |
| "sync develop into the release branch"        | **B.** Opens a PR `develop` → open `release/x.y.z` so you can review the last changes before they go into the release. |
| "the release is merged" / "back-merge main"   | **C.** Pulls `main` locally and merges it into `develop`; asks before pushing.                                         |
| "run the release flow"                        | Everything that applies, in the order C → A → B. A new release (D) only when you ask for it.                           |

## A typical release

1. **Work on `develop`** and commit with conventional commits (`feat:`, `fix:`, …). Good commit types help the version recommendation.
2. **"push develop"**: Claude pushes without the release prompt, waits for CI, and if a check fails it reproduces it locally with Nx, fixes it, commits and pushes again (at most three rounds, then it reports back). Infra problems (secrets, Firebase, Nx Cloud) or unclear failures are handed to you.
3. **"release"**: once CI is green, Claude compares `develop` with the latest release tag (commits _and_ the actual diff) and shows a short summary with a recommendation:
   - **major**: breaking for visitors, such as a big redesign, removed or renamed routes, a removed language, or removed GraphQL fields;
   - **minor**: something new and visible, such as a page, section, feature, language or new content;
   - **patch**: only fixes and invisible improvements (`fix`, `perf`, `refactor`, `style`, `test`, `ci`, `docs`, `chore`, dependency updates).

   You pick the version (or a custom one, or "don't release"). Claude then creates `release/x.y.z` from the green commit with the `chore(release): x.y.z` version commit, exactly like `npm run nx:release`, pushes it and asks whether to open the PR `release/x.y.z` → `main`.

4. **Review the release PR** on GitHub: the **Source branch**, **Version** and **CI** checks plus the Firebase preview. You merge it yourself (with a merge commit); that tags the release and deploys it live.
5. **Late fixes before the merge** go on `develop`, never on the release branch: say "push develop", then "sync develop into the release branch". Claude opens a PR `develop` → `release/x.y.z` for you to review and merge; the release PR into `main` then reruns its checks.
6. **After the merge**, say "the release is merged" (or "back-merge main"): Claude pulls `main` and merges it into `develop` so `develop` gets the new version, then asks whether to push `develop`.

## What Claude asks you about

- Which version to release, and whether to release at all when nothing user-facing changed.
- Whether to open the release PR into `main`.
- Merge conflicts, in any phase.
- CI failures that aren't a clear code fix, or before rerunning a failed job.
- Which release branch to use when more than one is open.
- Pushing `develop` after the back-merge.

What stays yours alone: merging any pull request (both `develop` → `release/x.y.z` and `release/x.y.z` → `main`), and anything on GitHub's settings and rulesets.

## Tips

- You can still do any step yourself (`git push` with the prompt, `npm run nx:release`); the skill just follows the same rules.
- CI takes a while (Playwright, e2e). Claude watches it in the background and reports back; ask "is CI green?" for an update in the meantime.
- To change how the skill behaves, edit [`.claude/skills/release-flow/SKILL.md`](.claude/skills/release-flow/SKILL.md) or ask Claude to update it.
