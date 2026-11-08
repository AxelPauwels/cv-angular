# technical-data-access-build-info

Build-time facts about this workspace, for the Technical pages:

- `VersionStore`: installed versions of the main frameworks and tools
- `ArchitectureStore`: every project with its domain, layer and dependencies,
  and the sheriff dependency rules

Both load JSON that `tools/build-info/generate.mjs` writes to
`dist/.build-info`, which the cv app serves at `/build-info`.

```sh
npx nx run technical-data-access-build-info:build-info
```
