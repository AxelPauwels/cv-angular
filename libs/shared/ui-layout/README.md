# shared-ui-layout

The app's navigation and settings controls, used by the shell in `apps/cv`.

- Navigation: `MainNavbar`, `SubNavbar` (swipeable tabs), `MobileMenu`, `NavAccordion`,
  with the `NavItem` type
- Settings: `LanguageSwitcher`, `ThemeSwitcher`, `FontSwitcher`, `ColorSchemeSwitcher`,
  `AccessibilitySwitcher`
- `DownloadMenu` (the CV as PDF) and `BackToTop`

All selectors start with `ds-`. Every control works with the keyboard and has a
translated accessible name.

```sh
npx nx run shared-ui-layout:test
```
