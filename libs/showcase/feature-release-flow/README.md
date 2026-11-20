# showcase-feature-release-flow

The Showcase > Release flow page: how code goes from `develop` through `release/x.y.z` to `main` and live.

Exports `ReleaseFlow` (`showcase-release-flow`) by name for the showcase shell's
`loadComponent`. The texts are translations with inline `<code>` rendered by
`translateParts`. The workflow itself: see [README.release.md](../../../README.release.md).

```sh
npx nx run showcase-feature-release-flow:test
```
