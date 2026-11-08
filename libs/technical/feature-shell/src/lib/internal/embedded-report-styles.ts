/**
 * CSS for each embedded report, on top of the app's font, scrollbar and transparent
 * background (see EmbeddedPage). The selectors belong to the generated reports, so
 * check them after updating spectaql, istanbul or Playwright. Theme colors are
 * written as `var(--mat-sys-…)`: EmbeddedPage resolves them from the app.
 */

/** SpectaQL: the page title already names the API, so its own <h1> goes */
export const GRAPHQL_DOCS_STYLES = `
#content > h1.doc-heading:first-of-type { display: none !important; }
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
