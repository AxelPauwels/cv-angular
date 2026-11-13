# Micro-frontends: `<cv-mfe>`

This app (the **host**) shows a micro-frontend from a separate repository, `cv-angular-mfe` (the **remote**). The remote is not an npm package: the browser loads it **at runtime** from wherever the federation manifest points. Nothing of it is in this repository or in this app's build.

| Remote URL                                  | Used by                                                   |
| ------------------------------------------- | --------------------------------------------------------- |
| `https://cv-angular-mfe.web.app` (deployed) | production builds (`federation.manifest.json`)            |
| `http://localhost:4300` (`nx serve cv-mfe`) | development builds (`federation.manifest.localhost.json`) |

## How it works

1. [main.ts](apps/cv/src/main.ts) calls `initFederation(environment.federationManifest)` before Angular starts. The environment picks the manifest:
   - [environment.ts](apps/cv/src/environments/environment.ts) (production) → [`federation.manifest.json`](apps/cv/public/federation.manifest.json)
   - [environment.development.ts](apps/cv/src/environments/environment.development.ts) → [`federation.manifest.localhost.json`](apps/cv/public/federation.manifest.localhost.json)
2. The manifest maps the name `cv-mfe` to the remote's `remoteEntry.json`.
3. `Wrapper` (`@cv/shared-ui-federation`) calls `loadRemoteModule('cv-mfe', './web-components')`. That module registers the custom element `<cv-mfe>` (Angular Elements), and the wrapper adds it to the page.
4. Angular and RxJS are shared as singletons with `strictVersion`, so host and remote must use the same Angular version range (currently `~22.2.0`).

## Using `<cv-mfe>` in this app

Use the typed component, not the generic `Wrapper`:

```ts
import { CvMfe } from '@cv/shared-ui-federation';
```

```html
<shared-cv-mfe [snippet]="code" language="typescript" [lineNumbers]="false" />
```

- Inputs come from [`CvMfeInputs`](libs/shared/ui-federation/src/lib/internal/cv-mfe.ts) and are type-checked in templates.
- Inputs left unset are not passed, so the remote's own defaults apply.
- Angular Elements turns every `input()` of the remote's component into a property of the same (camelCase) name; `CvMfe` sets them through `Wrapper`'s `inputs`.

`Wrapper` stays generic for other remotes: `<shared-wrapper [config]="config" [inputs]="{ ... }" />`. For a new remote, add its manifest entry and a small typed component like [`CvMfe`](libs/shared/ui-federation/src/lib/cv-mfe/cv-mfe.ts).

## Developing against the local remote

Run both projects on the same machine.

**1. Start the remote** (in `cv-angular-mfe`). It serves on port 4300 with live rebuilds:

```bash
npm start
```

**2. Build the host in development mode** (in this repository). This uses `federation.manifest.localhost.json`, so it loads the remote from `http://localhost:4300`:

```bash
npx nx run cv:build:development
```

**3. Serve that build** on a free port (4202 here):

```bash
python3 -m http.server 4202 --directory dist/dev/apps/cv/browser
```

Open http://localhost:4202/ and go to **Showcase → Micro-frontends**. (The static server has no SPA fallback: start at `/` and navigate in the app, don't reload on a deep link.)

In Claude Code's browser pane, this is the `cv-dev-local-mfe` server in [.claude/launch.json](.claude/launch.json).

Good to know:

- **Changes in the remote** show up after reloading the host page: the remote rebuilds itself, and the host fetches `remoteEntry.json` on every load.
- **Changes in the host** need step 2 again (then reload).
- **Don't use `nx run cv:serve-original`**: it's the plain Angular dev server, which knows nothing about federation. The host serves no `remoteEntry.json` there, and the remote fails with `Failed to resolve module specifier "@nf-internal/…"`.
- **`nx serve cv`** serves a production build, so it uses the deployed remote, not your local one.
- **Remote not running?** `<cv-mfe>` stays empty and the console shows `Remote 'cv-mfe' is not initialized`; the rest of the app keeps working. Start the remote, then reload the host page (the remote is only read at startup).

## When the remote ships a new version

The remote deploys itself: a merge to `main` in `cv-angular-mfe` builds and deploys it to Firebase (`https://cv-angular-mfe.web.app`). Its `remoteEntry.json` is served with `Cache-Control: no-cache`, and its JS files have hashed names.

**Same inputs, same Angular version: nothing to do here.** The next page load picks up the new version. No rebuild or redeploy of this app.

**Which version is live:** Technical → Versions lists every remote of the manifest under Micro-frontends, with the version it is deployed with. The page reads it at runtime from the remote's `version.json` (next to its `remoteEntry.json`, written by `nx run cv-mfe:version-info` from the remote's `package.json` on every build and serve). A remote that can't be reached, or that doesn't publish a `version.json`, shows as _unavailable_. In development this is your local remote: restart `npm start` there after pulling this change, so it serves `version.json`.

**The remote's inputs changed** (added, renamed, removed or different types):

1. Update [`CvMfeInputs`](libs/shared/ui-federation/src/lib/internal/cv-mfe.ts) to match the remote's API docs.
2. Add, rename or remove the matching `input()` in [`CvMfe`](libs/shared/ui-federation/src/lib/cv-mfe/cv-mfe.ts) and in its `inputs` computed.
3. Update the usages (`<shared-cv-mfe …>`) and [`cv-mfe.spec.ts`](libs/shared/ui-federation/src/lib/cv-mfe/cv-mfe.spec.ts).
4. Test against the local remote (above), then deploy this app.

Removing or renaming an input is a breaking change for this app: until the host is deployed, the old host keeps setting the old property, which the new remote ignores. Prefer adding the new input first and removing the old one later, or deploy both at the same time.

**The remote upgraded Angular or RxJS** (outside `~22.2.0` / `~7.8.0`): `strictVersion` makes the shared versions incompatible, so upgrade this app to the same range in the same release window.

**Trying a remote preview first:** a pull request in `cv-angular-mfe` gets a Firebase preview channel URL. Point `federation.manifest.localhost.json` at that URL's `remoteEntry.json` temporarily, run the steps under [Developing against the local remote](#developing-against-the-local-remote), and don't commit that change.
