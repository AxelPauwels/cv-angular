# showcase-data-access-service-status

Checks whether each external service the app depends on can be reached right now: the micro-frontend remote, CDNs, Google Fonts, Web3Forms, Firebase AI Logic and the CV's profile links.

- `ServiceStatusStore`: checks them as soon as they are known and again on `recheck()`.
  Not provided in root: the page provides it, so every visit checks afresh and nothing is
  checked while the page is closed.
- The frontend types in `src/lib/types`

```sh
npx nx run showcase-data-access-service-status:test
```
