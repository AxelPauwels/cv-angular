# cv (the app)

The Angular application that is deployed to Firebase Hosting
(<https://axel-pauwels.web.app>). It holds almost no features itself: it composes the
domain libraries in [`libs/`](../../libs) and owns only what is app-wide.

```
src/index.html                     SEO and social meta, fonts, the pre-paint settings script
src/main.ts, bootstrap.ts          starts Native Federation, then the app
src/app/app.config.ts              providers: router, http + in-browser GraphQL, i18n, contact, assistant
src/app/app.routes.ts              one lazy entry per domain shell, plus redirects of old urls
src/app/shell/                     header, menus, footer, walker and tour (deferred)
src/app/title/                     every page its own translated <title>, announced on navigation
src/app/preloading/                preloads the lazy pages once the first page is idle
src/environments/                  build settings; secrets come from src/tokens (gitignored)
src/styles/                        global styles in ITCSS layers (1.settings ... 9.utilities)
public/                            static files: icons, manifest, robots.txt, sitemap.xml, assets
```

## Performance

- Every page is a lazy chunk; `IdlePreloadingStrategy` fetches the others only after the
  first page has rendered and the browser is idle.
- Heavy parts load on demand: the GraphQL schema on the first query, the tour and walker
  with `@defer`, Lordicon on first use, Hashbrown and Firebase only on the assistant page.
- `index.html` preloads the icon font, the active body font and, on the home page, the
  hero photo; Material Symbols is a subset with only the icons the app uses
  ([README.icons.md](../../README.icons.md)).

## SEO

Translated document titles per route, a static description, Open Graph and Twitter
meta for link previews, `schema.org/Person` structured data, `robots.txt`, `sitemap.xml`
and a web app manifest. When you add or move a page, update `public/sitemap.xml`.

## Run, test, build

```sh
npx nx run cv:serve                # dev server (http://localhost:4201)
npx nx run cv:test                 # unit tests (Vitest, in Chromium)
npx nx run cv:build                # production build to dist/apps/cv
npm run build:production           # the full release build, with reports and docs
```

Local secrets (Tolgee, Web3Forms, Firebase): copy
`src/tokens/environment.tokens.example.ts` to `environment.tokens.ts` and fill it in.
End-to-end tests live in [`apps/cv-e2e`](../cv-e2e).
