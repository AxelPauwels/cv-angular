# showcase-feature-service-status

The Showcase > Service status page: a live check of every external service the app uses.

Exports `ServiceStatusPage` (`showcase-service-status`) by name for the showcase shell's
`loadComponent`. It provides its own `ServiceStatusStore` from
[`@cv/showcase-data-access-service-status`](../data-access-service-status), so checks run only
while the page is open.

```sh
npx nx run showcase-feature-service-status:test
```
