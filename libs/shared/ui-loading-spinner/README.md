# shared-ui-loading-spinner

`LoadingSpinner` (`ds-loading-spinner`): the spinner shown while a store loads.

It waits `LOADING_DELAY_MS` before it appears and then stays at least
`LOADING_MIN_DURATION_MS` (from [`@cv/shared-util-loading`](../util-loading)), so fast loads
don't flash. Announced to screen readers with a translated label.

```sh
npx nx run shared-ui-loading-spinner:test
```
