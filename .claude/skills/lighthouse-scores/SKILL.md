---
name: lighthouse-scores
description: Re-audit the Google Lighthouse scores of one or more pages of the deployed app and merge them into the Showcase > Lighthouse page, without auditing every page. Use when the user asks to update, refresh or fill in the Lighthouse scores of specific pages (by menu name like "Technical > Compodoc" or by route), when a page shows no scores on the Lighthouse page, or after a new page was added to the app.
---

# Update Lighthouse scores for specific pages

The Showcase's Lighthouse page reads its scores from
`libs/showcase/feature-lighthouse/src/lib/internal/lighthouse-scores.json`
(keyed by router link). `tools/lighthouse/audit.mjs` fills it. A page with no
entry there shows as "not audited".

## 1. Map the user's words to routes

The user names pages by menu label ("Technical > Compodoc", "Showcase > Release flow").
Resolve each to its router link with `LIGHTHOUSE_SECTIONS` in
`libs/showcase/feature-lighthouse/src/lib/internal/lighthouse-pages.ts` (labels are
`t.nav.*` keys, links come from `ROUTES` in `@cv/shared-util-routing`). Examples:
`/technical/compodoc`, `/showcase/service-status`, `/showcase/release-flow`.

If a label is ambiguous or slightly off (e.g. "Service status > Release flow"), pick
the page whose name matches the last part and say which route you used.

Check which pages have no scores yet:

```bash
node -e 'const r=require("./libs/showcase/feature-lighthouse/src/lib/internal/lighthouse-scores.json");for(const p of process.argv.slice(1))console.log(p,JSON.stringify(r.pages[p]??"missing"))' /technical/compodoc
```

## 2. A new page? Register it first

Every audited route must be in **both** lists, or the script rejects it ("Not in
PAGES") or the page never shows its scores:

- `PAGES` in `tools/lighthouse/audit.mjs`
- `LIGHTHOUSE_SECTIONS` in `lighthouse-pages.ts` (with its `t.nav.*` label key)

## 3. Run the audit for just those pages

```bash
npx nx run showcase-feature-lighthouse:audit --pages=/technical/compodoc,/showcase/release-flow
```

- Comma separated, no spaces. `--url=https://…` audits another deployment (default: the live site), `--runs=5` for more runs per page (median is kept, default 3).
- With `--pages` only those entries are merged; the other pages, the run details
  (url, time, version) and the history folder stay as they are.
- It takes about 1–2 minutes per page locally; run it in the background when auditing many.
- It audits the **deployed** site: unreleased changes on develop are not measured. Say so if the user expects a local change to be reflected.

### Where it runs matters

- `PSI_API_KEY` in the gitignored `.env` → runs on Google PageSpeed Insights: stable, comparable scores. Never print or commit the key.
- Without it → local headless Chrome. The desktop preset does not throttle the CPU, so a busy laptop lowers **Performance** (often 80s instead of 90s). Accessibility, best practices and SEO are reliable either way.

Check without revealing the value:

```bash
awk -F= '/^PSI_API_KEY/{print "PSI_API_KEY length:", length($2)}' .env
```

If it ran locally and Performance is clearly lower than comparable pages, tell the user and suggest setting `PSI_API_KEY` (or rerunning when the machine is idle) instead of presenting the number as final.

## 4. Verify and report

1. Print the new scores for the audited routes (command from step 1).
2. `git diff --stat` should only touch `lighthouse-scores.json` (plus the two lists from step 2 for a new page).
3. Optionally open the Showcase > Lighthouse page in the dev server to see the gauges.
4. Report per page: performance / accessibility / best practices / SEO, and whether it ran on PSI or locally.

Commit only when the user asks: `chore(lighthouse): update scores for <pages>`.
