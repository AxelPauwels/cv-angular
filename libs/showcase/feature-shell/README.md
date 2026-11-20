# showcase-feature-shell

The Showcase section (`/showcase/*`): its sub-navigation and the lazy routes to the showcase pages.

- `showcaseFeatureShellRoutes`: lazy-loaded by `app.routes.ts` under `ROUTES.SHOWCASE.ROOT`;
  micro-frontends, Lighthouse, service status, AI assistant, release flow and feature toggles
  are each their own lazy chunk with a translated `title`
- `SHOWCASE_NAV_ITEMS`: the menu items, also used by the main and mobile menus

```sh
npx nx run showcase-feature-shell:test
```
