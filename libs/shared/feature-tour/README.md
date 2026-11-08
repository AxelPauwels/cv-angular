# shared-feature-tour

The guided tour: a scrim with a spotlight on a highlighted element, the step's
text in the middle and back / exit / next at the bottom. It navigates to each
step's page and waits for the target to render.

- Start or stop it with `TourService` from `@cv/shared-data-access`.
- The app shell renders `<shared-tour />` inside `@defer (when tour.active())`,
  so none of this code loads before a visitor starts the tour.
- Steps live in `tour-steps.ts` (`TOUR_STEPS`). A target is a CSS selector;
  pages mark elements with a `data-tour` attribute. Texts are the
  `t.tour.step.<id>.{label,title,text}` translation keys.

Run `npx nx run shared-feature-tour:test` to execute the unit tests.
