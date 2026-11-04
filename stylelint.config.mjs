import scssAllowedImports from './tools/stylelint/scss-allowed-imports.mjs';

/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard-scss'],
  plugins: ['stylelint-order', scssAllowedImports],
  rules: {
    'order/properties-alphabetical-order': true,
    // Formatting is Prettier's job: it breaks long expressions after operators
    'scss/operator-no-newline-after': null,
    // Flags valid shorthands like `font: 1rem/1.5rem` as unspaced division
    'scss/operator-no-unspaced': null,
    // Allow blank lines to group related variables
    'scss/dollar-variable-empty-line-before': null,
    // Angular's view-encapsulation escape hatch, needed for overlay content like mat-menu panels
    'selector-pseudo-element-no-unknown': [
      true,
      { ignorePseudoElements: ['ng-deep'] },
    ],
  },
  overrides: [
    {
      // Component styles load Sass only through the ITCSS layers (resolved via the
      // style include paths). Publishable packages must not depend on the app,
      // so they are left out.
      files: ['apps/**/*.scss', 'libs/**/*.scss'],
      rules: { 'cv/scss-allowed-imports': true },
    },
    {
      // The global styles: relative paths within the layers (e.g. '../3.vendors/mat'),
      // same-folder partials ('e-html') and Sass modules; no packages
      files: ['apps/cv/src/styles.scss', 'apps/cv/src/styles/**/*.scss'],
      rules: {
        'cv/scss-allowed-imports': [
          true,
          {
            allowed: [/^\.{1,2}\//, /^[\w-]+$/, /^sass:/],
            hint: "only layers 1-3 load packages; use a relative path, e.g. @use '../3.vendors/mat'",
          },
        ],
      },
    },
    {
      // Settings, tools and vendors are where packages like @angular/material come in
      files: [
        'apps/cv/src/styles/1.settings/**/*.scss',
        'apps/cv/src/styles/2.tools/**/*.scss',
        'apps/cv/src/styles/3.vendors/**/*.scss',
      ],
      rules: { 'cv/scss-allowed-imports': null },
    },
  ],
  ignoreFiles: [
    'dist/**',
    'coverage/**',
    'apps/cv/src/styles/1.settings/icomoon/**',
  ],
};
