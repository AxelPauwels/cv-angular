# shared-ui-store-loading-error

`StoreLoadingError` (`ds-store-loading-error`): the message shown when a store failed to load.

```html
@if (store.error()) {
<ds-store-loading-error message="t.error.load.experience" [error]="store.error()" />
}
```

It is an alert, so screen readers announce it when it replaces the spinner.

```sh
npx nx run shared-ui-store-loading-error:test
```
