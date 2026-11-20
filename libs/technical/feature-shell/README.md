# technical-feature-shell

The Technical section (`/technical/*`): its sub-navigation and the lazy routes to the technical pages.

- `technicalFeatureShellRoutes`: lazy-loaded by `app.routes.ts` under `ROUTES.TECHNICAL.ROOT`;
  architecture, foundations and versions are lazy pages, the generated reports (project
  graph, GraphQL docs, Compodoc, coverage, e2e report) are shown with `ds-embedded-page`
- `TECHNICAL_NAV_ITEMS`: the menu items, also used by the main and mobile menus

```sh
npx nx run technical-feature-shell:test
```
