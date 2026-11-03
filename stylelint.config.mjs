/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard-scss'],
  plugins: ['stylelint-order'],
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
  ignoreFiles: [
    'dist/**',
    'coverage/**',
    'apps/cv/src/styles/1.settings/icomoon/**',
  ],
};
