# showcase-feature-admin

Feature toggles (`/showcase/feature-toggles`): switches features of the app on or off with the
feature toggles from `FeatureToggleService` (`@cv/shared-data-access`). The
choices are remembered in this browser only.

The barrel default-exports the page for the showcase shell's lazy `feature-toggles` route.
The page stays reachable when its own menu item is switched off: the name in the
footer links to it.
