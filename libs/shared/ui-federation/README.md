# shared-ui-federation

Loads micro-frontend remotes ([Native Federation](https://www.npmjs.com/package/@angular-architects/native-federation)) as web components.

- `Wrapper` (`ds-wrapper`) with a `WrapperConfig`: loads a remote from the manifest and sets
  its inputs (any value, not only strings)
- `CvMfe` (`ds-cv-mfe`) and `cvMfeWrapperConfig`: the typed wrapper for the `cv-mfe` remote

Loading, typed inputs, local development and updating a remote: see
[README.micro-frontends.md](../../../README.micro-frontends.md).

```sh
npx nx run shared-ui-federation:test
```
