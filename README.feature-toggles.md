# Feature toggles

Every feature, menu item and navbar icon that can be switched on or off, managed on
the **Showcase > Feature toggles** page (`/showcase/feature-toggles`; the old `/admin`
url redirects there).

## Changing what visitors see by default

Edit [`feature-toggle-defaults.ts`](libs/shared/data-access/src/lib/feature-toggle-defaults.ts)
before a build: `true` is on, `false` is off. That is what every visitor sees until they
change a toggle themselves, and what "reset to defaults" goes back to.

A visitor's own changes are kept in their browser (`localStorage`, key `cv-feature-toggles`),
but only the toggles that differ from the default. So a changed default still reaches
everyone who never touched that toggle.

## Adding a toggle

1. Add it to `FEATURE_TOGGLES` in
   [`feature-toggles.ts`](libs/shared/data-access/src/lib/feature-toggles.ts) with its
   group (`general`, a menu, or `navbar`) and a label translation key
   (see [README.translations.md](README.translations.md)).
2. Give it a default in `feature-toggle-defaults.ts`; the compiler fails when one is missing.
3. Read it where it applies:

   ```ts
   protected readonly walker = inject(FeatureToggleService).isEnabled('walker');
   // template: @if (walker()) { ... }
   ```

Sub-menu items name their main menu item as `parent`: switching off the last sub item
switches the main item off too.

In unit tests, `saveFeatureTogglesForTesting({ walker: false })` (`@cv/shared-data-access`) starts
a test with every toggle on, except the ones you pass.
