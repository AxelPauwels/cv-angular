# cv-feature-shell

The CV section (`/cv/*`): its sub-navigation and the lazy routes to the cv pages.

- `cvFeatureShellRoutes`: lazy-loaded by `app.routes.ts` under `ROUTES.CV.ROOT`; each child
  page (personal, education, experience, skills, references) is its own lazy chunk
  with a translated `title` (`t.nav.*`)
- `CV_NAV_ITEMS`: the menu items, also used by the main and mobile menus

The shell itself is private (`src/lib/internal`).

```sh
npx nx run cv-feature-shell:test
```
