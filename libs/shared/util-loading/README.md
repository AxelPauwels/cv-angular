# shared-util-loading

Timing for loading indicators (spinners, progress bars), shared so every
indicator in the app behaves the same:

- `LOADING_DELAY_MS`: loads faster than this never show an indicator
- `LOADING_MIN_DURATION_MS`: once shown, an indicator stays at least this long
- `LOADING_PREVIEW_MS`: holds the indicator on every visit to preview its design
