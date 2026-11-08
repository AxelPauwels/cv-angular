# showcase-feature-lighthouse

The Showcase's Lighthouse page: the Google Lighthouse scores (desktop) for
performance, accessibility, best practices and SEO of every page of the
deployed app, as a tree of the main menu with its sub menu items.

The scores live in `src/lib/internal/lighthouse-scores.json`. Audit the
deployed app again (needs Google Chrome) with:

```bash
npx nx run showcase-feature-lighthouse:audit
```

Pass `--url=https://…` to audit another deployment. A new page needs an entry
in `LIGHTHOUSE_SECTIONS` (`lighthouse-pages.ts`) and in `PAGES`
(`tools/lighthouse/audit.mjs`).
