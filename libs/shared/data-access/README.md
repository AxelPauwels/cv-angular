# shared-data-access

App-wide services and state that every domain may use.

- `graphqlResource()`: a signal-based, typed GraphQL query on top of `HttpClient`
- `inBrowserGraphqlInterceptor`: answers `POST /graphql` in the browser with the
  schema from [`@cv/api`](../../api), lazy-loaded on the first query
- `ThemeService`, `FontService`, `AccessibilityService` (+ `THEMES`, `FONTS`, accessibility
  settings): the visitor's appearance choices, saved in `localStorage` and mirrored by the
  inline script in `apps/cv/src/index.html`
- `TourService`: the guided tour's steps and state
- `FeatureToggleService` and `FEATURE_TOGGLES` (+ testing helpers): see
  [README.feature-toggles.md](../../../README.feature-toggles.md)
- `FEDERATION_MANIFEST_URL`: the micro-frontend manifest the app started with
- `withDevToolsForDebugMode()`: Redux DevTools for the signal stores, only in debug mode

```sh
npx nx run shared-data-access:test
```
