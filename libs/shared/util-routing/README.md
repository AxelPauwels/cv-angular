# shared-util-routing

Every route path of the app, per domain: the single place to change a url.

```ts
import { ROUTES } from '@cv/shared-util-routing';

{ path: ROUTES.CV.SKILLS, ... }          // a path segment, for a route config
routerLink = ROUTES.CV.SKILLS_ROUTER_LINK; // the absolute url, '/cv/skills'
```

The spec checks that every path has a router link, every url has one owner and every
segment is kebab-case. When you add or move a page, also update
`apps/cv/public/sitemap.xml`.

```sh
npx nx run shared-util-routing:test
```
