# cv-e2e

[Playwright](https://playwright.dev) end-to-end tests for [`apps/cv`](../cv).

```
src/shared-ui/      the shared UI libraries in the real app (card, timeline, layout, federation, ...)
src/features/       flows across pages (e.g. the AI assistant link)
src/support/        helpers shared by the specs
```

```sh
npm run e2e                         # every browser, then opens the HTML report
npm run e2e:watch                   # Playwright UI mode
E2E_BROWSERS=chromium npx nx run cv-e2e:e2e   # one browser
```

Locally the tests start (or reuse) the dev server on port 4201; in CI they run against
`cv:serve-static` on port 4200. `BASE_URL` points them at another deployment.

CI runs Chromium only on `develop` and every browser on release branches, `main` and
pull requests into `main`. The HTML report is published with the app under
**Technical > End-to-end tests**.

> The contact form sends real e-mail: never submit it in a test without stubbing the
> Web3Forms request with `page.route()`.
