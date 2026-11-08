import stylelint from 'stylelint';

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

const ruleName = 'cv/scss-allowed-imports';

const defaultHint =
  "load styles through an ITCSS layer, e.g. @use '1.settings' or @use '3.vendors/mat'";

const messages = ruleMessages(ruleName, {
  rejected: (atRule, url, hint) => `Unexpected @${atRule} '${url}': ${hint}`,
});

const meta = {
  url: 'https://github.com/AxelPauwels/cv-angular/blob/main/tools/stylelint/scss-allowed-imports.mjs',
};

/** The ITCSS layer folders in apps/cv/src/styles (1.settings ... 9.utilities) and Sass's built-in modules */
const defaultAllowed = [/^[1-9]\.[a-z-]+(\/|$)/, /^sass:/];

/**
 * Restricts what `@use`, `@forward` and `@import` may load. By default (component
 * styles) only the ITCSS layers, e.g. `@use '1.settings'` or `@use '3.vendors/mat'`,
 * so the layers stay the single entry point for settings, tools and vendors.
 * Options: `allowed: [RegExp | string]` replaces the default patterns and
 * `hint` replaces the advice in the error message.
 */
const ruleFunction = (primary, secondaryOptions) => (root, result) => {
  const valid = validateOptions(
    result,
    ruleName,
    { actual: primary, possible: [true] },
    {
      actual: secondaryOptions,
      possible: {
        allowed: [
          (value) => typeof value === 'string' || value instanceof RegExp,
        ],
        hint: [(value) => typeof value === 'string'],
      },
      optional: true,
    }
  );
  if (!valid) {
    return;
  }

  const hint = secondaryOptions?.hint ?? defaultHint;
  const allowed = (secondaryOptions?.allowed ?? defaultAllowed).map(
    (pattern) => (pattern instanceof RegExp ? pattern : new RegExp(pattern))
  );

  root.walkAtRules(/^(use|forward|import)$/, (atRule) => {
    // @import may list several urls; @use / @forward have one
    const urls = [...atRule.params.matchAll(/(['"])(.+?)\1/g)].map(
      (match) => match[2]
    );
    for (const url of urls) {
      if (!allowed.some((pattern) => pattern.test(url))) {
        report({
          ruleName,
          result,
          node: atRule,
          message: messages.rejected(atRule.name, url, hint),
          word: url,
        });
      }
    }
  });
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
