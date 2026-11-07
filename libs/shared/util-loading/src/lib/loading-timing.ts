/**
 * Timing for every loading indicator (spinner, progress bar), so they all
 * behave the same: no flash for fast loads, no flicker for slow ones.
 */

/** Loads faster than this never show an indicator (debounces the loading flag) */
export const LOADING_DELAY_MS = 300;

/** Once an indicator shows, it stays at least this long so it never flickers */
export const LOADING_MIN_DURATION_MS = 1000;

/** Holds the indicator on screen this long on every visit, to preview its design; 0 turns it off */
export const LOADING_PREVIEW_MS = 0;
