# shared-ui-lordicon

`Lordicon` (`ds-lordicon`): animated [Lordicon](https://lordicon.com) icons.

The icon JSON files live in `src/assets` and are copied to `assets/lordicon` by the app
build; the `@lordicon/element` player is imported on first use. Size an icon with `font-size` or `--ds-lordicon-size`;
the colors follow the theme. `thick` matches the line width of Icomoon and Material Symbols
glyphs. Icons animate on load or scroll and stay still with reduced motion.

```sh
npx nx run shared-ui-lordicon:test
```
