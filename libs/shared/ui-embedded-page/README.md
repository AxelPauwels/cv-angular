# shared-ui-embedded-page

Shows a standalone page of this site (a test report, Compodoc, the project graph, ...) inside the app layout.

`EmbeddedPage` (`ds-embedded-page`) loads it in an iframe, so its own scripts and styles
can't clash with the app's. The route data gives the `src`, a `title` translation key and
optional `styles`; `applyAppStyles()` carries the app's theme, font and light or dark mode
into the page. Only same-origin paths are trusted as resource urls.

```sh
npx nx run shared-ui-embedded-page:test
```
