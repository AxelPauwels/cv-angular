# Icons

The app uses two icon fonts:

| Font                                  | For                                                         | Loaded from                                                    | Use it as                                                       |
| ------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------- |
| [Material Symbols](#material-symbols) | General UI icons (`menu`, `close`, `arrow_back`, `send`, …) | Google Fonts, through the `<link>` in `apps/cv/src/index.html` | `<mat-icon fontSet="material-symbols-outlined">send</mat-icon>` |
| [Icomoon (`cvIconFont`)](#icomoon)    | Brand and technology logos (`angular`, `github`, `nx`, …)   | Self-hosted, `apps/cv/src/styles/1.settings/icomoon/`          | `<span class="cv-icon cv-icon-angular"></span>`                 |

## Material Symbols

### TL;DR

Just use the icon and commit: the pre-commit hook (`.husky/pre-commit`) updates the font URL in `index.html` and adds it to your commit. If `index.html` also has unstaged changes of your own, the hook updates the URL but stops the commit, so you can stage what you want from it and commit again.

```bash
# Update the font URL by hand (what the hook does)
npm run material-symbols:extract

# Check only (this is what CI runs; fails when the URL is out of date)
npx nx run cv:material-symbols
```

### How it works

`index.html` loads the Material Symbols Outlined font from Google Fonts with `icon_names=…`, so Google serves a subset of a few KiB with only the icons the app uses instead of the full ~290 KiB font. The catch: an icon that is not in that list renders as its name in plain text ("arrow_back") instead of a glyph.

`tools/material-symbols/material-symbols.mjs` finds the icon names in the code and checks (CI) or rewrites (`--write`) the URL. The axes are pinned to what the app renders: 24px optical size, weight 400, outlined, grade 0.

### Adding an icon

1. Find the exact name on [fonts.google.com/icons](https://fonts.google.com/icons) in the **Material Symbols Outlined** style, for example `send`.
2. Use it in a way the script recognizes (see below).
3. Commit. The pre-commit hook updates `apps/cv/src/index.html` and adds it to the commit (or run `npm run material-symbols:extract` yourself).
4. Check in the browser that it renders as a glyph, not as text.

### Where the script looks

Outside `*.spec.ts`, `generated/` folders and `libs/api`, in `apps/cv/src` and `libs`:

| Where                      | Example                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| HTML: `<mat-icon>` text    | `<mat-icon fontSet="material-symbols-outlined">send</mat-icon>`                            |
| HTML: quoted names in it   | `<mat-icon fontSet="material-symbols-outlined">{{ open() ? 'close' : 'menu' }}</mat-icon>` |
| HTML: static `icon` input  | `<ds-card icon="code">`                                                                    |
| HTML: bound `[icon]` input | `[icon]="degree ? 'workspace_premium' : undefined"`                                        |
| TS: an `icon:` line        | `{ icon: 'send' }`                                                                         |
| TS: a `*_ICONS` map        | `const THEME_ICONS = { light: 'light_mode', dark: 'dark_mode' };`                          |

### What it misses

- Names built at runtime: `'arrow_' + direction`, or a name that comes from the API.
- Names in TS outside an `icon:` line or a `*_ICONS` map, such as `const myIcon = 'send'`.
- `<mat-icon>` without `fontSet="material-symbols-outlined"`.

For these, rewrite the code into one of the patterns above, or list the name in a `*_ICONS` map. The script can also pick up a few names that are not Material Symbols (for example an Icomoon icon on an `icon:` line, like `github` or `linkedin`). Google ignores unknown names, so they only make the URL a bit longer.

## Icomoon

`cvIconFont` is a custom icon font made in the [IcoMoon app](https://icomoon.io/app), mostly brand and technology logos (devicons) that Material Symbols does not have. It is self-hosted and needs no script: the font files and generated styles live in `apps/cv/src/styles/1.settings/icomoon/` and are pulled into the global styles by `1.settings/_index.scss`.

| File                           | What                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------- |
| `selection.json`               | The IcoMoon project. Import this to edit the font; never edit it by hand.       |
| `fonts/cvIconFont.*`           | The font files.                                                                 |
| `style.scss`, `variables.scss` | The `@font-face`, the `.cv-icon` base class and one `.cv-icon-<name>` per icon. |
| `demo.html`                    | Open it in a browser to see every icon and its name.                            |

### Using an icon

```html
<span class="cv-icon cv-icon-angular" aria-hidden="true"></span>
```

Several components take just the name and add the classes themselves, for example the `icon` input of `ui-skill` and the contact links (`'cv-icon-' + icon`). `ds-card` supports both fonts: `icon="angular" iconFont="cv"` for Icomoon, Material Symbols otherwise. Icons are decorative: hide them from screen readers with `aria-hidden="true"` and put the meaning in visible text or an `aria-label` on the surrounding control.

### Adding an icon

1. Open [icomoon.io/app](https://icomoon.io/app) and import `apps/cv/src/styles/1.settings/icomoon/selection.json` (**Import Icons**, or **Main Menu → Manage Projects**).
2. Add the icon (from an IcoMoon library or your own SVG) to the `cvIconFont` set and give it a lowercase name.
3. **Generate Font**. In **Preferences**, keep the font name `cvIconFont`, the class prefix `cv-icon-` and **Generate Sass** on.
4. Download, and replace the files in `apps/cv/src/styles/1.settings/icomoon/` with the ones from the zip (`selection.json`, `fonts/`, `style.scss`, `variables.scss`, `demo.html`).
5. Run Stylelint and Prettier on the folder (the pre-commit hook does this for staged files), and check the new icon in the app.

Forgetting step 4's `selection.json` means the next person who imports it loses your icon, so always commit it.
