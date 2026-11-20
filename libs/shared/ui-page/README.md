# shared-ui-page

The building blocks every page uses, so all pages share one layout.

- `PageLayout` (`ds-page-layout`, `width="narrow" | "wide"`): the page's width and spacing
- `PageTitle` (`ds-page-title`): the page's single `<h1>`, from a translation key
- `SectionHeading` (`ds-section-heading`): an `<h2>` section heading, from a translation key

```sh
npx nx run shared-ui-page:test
```
