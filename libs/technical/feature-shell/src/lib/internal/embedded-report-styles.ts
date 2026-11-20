/**
 * CSS for each embedded report, on top of the app's font, scrollbar and transparent
 * background (see EmbeddedPage). The selectors belong to the generated reports, so
 * check them after updating spectaql, istanbul, Playwright or Compodoc. Theme
 * colors are written as `var(--mat-sys-…)`: EmbeddedPage resolves them from
 * the app.
 */

/**
 * SpectaQL: the page title already names the API, so its own <h1> goes. The
 * sidebar with the navigation (`#nav`) gets a soft version of the theme's tag
 * color (`.card__tag`'s, half mixed with the page surface), on wide screens
 * and as the drawer over the docs below SpectaQL's 48em breakpoint, so the
 * docs don't show through it there. The
 * sticky bar with the drawer's button gets the theme's brown secondary color
 * instead of SpectaQL's white.
 */
export const GRAPHQL_DOCS_STYLES = `
#content > h1.doc-heading:first-of-type { display: none !important; }
#sidebar {
  background: color-mix(in srgb, var(--mat-sys-primary-container) 50%, var(--mat-sys-surface)) !important;
  color: var(--mat-sys-on-primary-container) !important;
}
#sidebar :is(a, button, h4, h5) { color: inherit !important; }
@media (width < 48em) {
  #mobile-navbar {
    background: var(--mat-sys-secondary) !important;
    color: var(--mat-sys-on-secondary) !important;
  }
  #mobile-navbar .sidebar-open-button::after { color: inherit !important; }
  #mobile-navbar .hamburger::after {
    background: currentColor !important;
    box-shadow: 0 5px 0 currentColor, 0 10px 0 currentColor !important;
  }
  #mobile-navbar .sidebar-open-button { color: inherit !important; }
}
`;

/** Istanbul: pill-shaped search field, fractions and coverage bars, no footer */
export const CODE_COVERAGE_STYLES = `
#fileSearch, span.fraction, div.chart { border-radius: 50px !important; }
#fileSearch { padding: 4px 12px !important; border: 1px solid var(--mat-sys-on-surface-variant) !important; }
span.fraction { padding: 4px 8px !important; }
div.chart { overflow: hidden !important; }
div.footer { display: none !important; }
`;

/**
 * Playwright: the file headers in the theme's light primary (primary-fixed, tone
 * 90: the section taglines and the tour use it), light in both modes, with its
 * matching dark text for contrast; a white search field with dark text.
 */
export const END_TO_END_TESTS_STYLES = `
.chip-header {
  background-color: var(--mat-sys-primary-fixed) !important;
  color: var(--mat-sys-on-primary-fixed) !important;
}
.chip-header svg { fill: currentColor !important; color: inherit !important; }
.input-contrast {
  background-color: white !important;
  color: var(--mat-sys-on-primary-fixed) !important;
}
.input-contrast::placeholder { color: var(--mat-sys-on-primary-fixed-variant) !important; }
`;

/**
 * Compodoc:
 * - its dark mode switch is hidden from view, keyboard and screen readers
 *   (`visibility: hidden` takes it out of the Tab order), but stays in the page:
 *   Compodoc's own script still reads and sets it, so its dark mode keeps
 *   following the stored choice and the system setting;
 * - its menu (the side menu, and on phones the drop-down menu and the bar at
 *   the top) gets a soft version of the theme's tag color (`.card__tag`'s, half
 *   mixed with the page surface) instead of Compodoc's grey, also in its dark
 *   mode; the current page's link is in the theme's primary color instead of
 *   Compodoc's blue. The search field keeps its own look.
 */
export const COMPODOC_STYLES = `
.dark-mode-switch {
  visibility: hidden !important;
}

.menu a.active { color: var(--mat-sys-primary) !important; }

a.navbar-brand { pointer-events: none !important; }
`;
