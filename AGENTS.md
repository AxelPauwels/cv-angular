<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

# Project guidelines

Angular 22 CV app in an Nx monorepo (npm). Run everything through Nx: `npx nx run <project>:<target>`.

## Priorities: performance, accessibility, security

These three come first in everything you build or change, before convenience or speed of delivery.

- **Performance**: lazy-load routes and heavy code, keep the client bundle small (no runtime-heavy libraries, no graphql-js in the client), prefer signals and `OnPush`-friendly patterns, avoid unnecessary change detection, subscriptions, network requests and re-renders, and use `@defer` / optimized images where they fit.
- **Accessibility**: semantic HTML first, WCAG 2.2 AA as the baseline, full keyboard support with visible focus, correct labels and ARIA only where native semantics fall short, sufficient contrast in every theme palette, and respect `prefers-reduced-motion`.
- **Security**: no secrets in the repo or the bundle, no `innerHTML` / `bypassSecurityTrust*` without sanitizing, validate external input, keep dependencies minimal and trusted.

**When a request would cost performance, accessibility or security, stop and ask before implementing it.** This applies to agents and skills alike. Explain the trade-off in one or two sentences (e.g. "this adds ~80 kB to the initial bundle", "this carousel has no keyboard support") and offer a better alternative. Don't silently implement the weaker version, and don't silently swap in a different solution either.

## Architecture: domains, layers and boundaries

Libraries live in `libs/<domain>/<layer>-<name>`.

- **Domains**: `cv`, `showcase`, `technical`, and `shared` (usable by every domain). `libs/api` is the GraphQL server (`domain:shared`, `type:api`). A domain only depends on itself and `shared`, never on another domain.
- **Layers** (allowed dependencies):
  - `feature`: smart components, routes, pages → `feature`, `ui`, `data-access`, `api`, `util`
  - `ui`: presentational components, inputs/outputs only, no services or data fetching → `ui`, `util`
  - `data-access`: stores, services, GraphQL operations, mappers → `data-access`, `api`, `util`
  - `util`: pure functions and types → `util`
- **Encapsulation**: each lib's public API is `src/index.ts`. Anything in an `internal/` folder is private to its lib; never import it from outside.
- **[`sheriff.config.ts`](sheriff.config.ts) is the source of truth** for these rules and runs through ESLint and `npm run sheriff:verify`. Never work around a violation (deep imports, `eslint-disable`, moving code to `shared` just to make it importable). If a change needs a new dependency direction, ask first.
- New libs: use the Nx generators (`nx-generate` skill), follow the naming above, and set matching `domain:` / `type:` tags in `project.json`.

## GraphQL data flow

Schema-first: `libs/api/src/lib/schema/type-defs.graphql` is the single source of truth. Each data-access lib owns its operations, generates private wire types, and maps them to hand-written frontend types in `src/lib/types`. Features never see API types. To change a field, use the `graphql-field` skill.

## Conventions

- Conventional commits (commitlint); Prettier, ESLint and Stylelint must pass.
- Styles follow ITCSS in `apps/cv/src/styles`; colors come from the theme palettes, never hard-coded.
- User-facing text goes through Tolgee translation keys (`libs/shared/data-access-i18n/src/i18n/*.json`), never hard-coded strings.
- Tests: Vitest (`nx run <project>:test`), Playwright e2e in `apps/cv-e2e`.
