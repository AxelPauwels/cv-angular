#!/usr/bin/env node
/**
 * Step 1 of 2: finds the keys Tolgee is missing and writes them to a review file.
 *
 * Pulls the latest translations from Tolgee (into a temporary folder: your local
 * language files are not touched) and compares them with the keys in the code
 * (see check.mjs for what counts as a key). A key ends up in the review file when
 * Tolgee lacks it, or has an empty value, in at least one language.
 *
 * The review file (scripts/tolgee/i18n-missing-keys.json, gitignored) lists each
 * key with a value per language, filled from your local language files where they
 * have one and empty otherwise:
 *
 *   "t.nav.cv-navigation": {
 *     "_usedIn": "libs/cv/feature-shell/.../cv-feature-shell.html:1",
 *     "en": "CV navigation",
 *     "nl": ""
 *   }
 *
 * Edit the values, remove keys you do not want, then run `npm run i18n:push-missing`.
 * Running this again keeps the values you already edited.
 *
 * Usage: node scripts/tolgee/missing.mjs
 */
import { existsSync } from 'node:fs';
import { relative } from 'node:path';
import {
  has,
  isUntranslated,
  pullTolgee,
  readJson,
  readLanguages,
  reviewFile,
  root,
  scanCode,
  toPattern,
  writeJson,
} from './lib.mjs';

console.log('Pulling the latest translations from Tolgee...');
const remote = pullTolgee();
const local = readLanguages();
const { used, dynamic } = scanCode();
const previous = existsSync(reviewFile) ? readJson(reviewFile) : {};

// Keys in the code plus keys Tolgee has in only some languages
const candidates = new Set([
  ...used.keys(),
  ...remote.flatMap((lang) => [...lang.keys.keys()]),
]);

const review = {};
for (const key of [...candidates].sort()) {
  const lacking = remote.filter(
    (lang) =>
      !has(lang, key) ||
      (lang.keys.has(key) && isUntranslated(key, lang.keys.get(key)))
  );
  if (lacking.length === 0) continue;

  const entry = {};
  if (used.has(key)) entry._usedIn = used.get(key)[0];
  for (const lang of lacking) {
    const edited = previous[key]?.[lang.code];
    const localValue = local.find((l) => l.code === lang.code)?.keys.get(key);
    entry[lang.code] =
      edited ??
      (localValue && !isUntranslated(key, localValue) ? localValue : '');
  }
  review[key] = entry;
}

// Templates cannot be added automatically; only report them
const unmatched = [...dynamic].filter(([template]) => {
  const pattern = toPattern(template);
  return remote.some(
    (lang) => ![...lang.keys.keys()].some((key) => pattern.test(key))
  );
});

const keys = Object.keys(review);
const empty = keys.filter((key) =>
  Object.entries(review[key]).some(([k, v]) => k !== '_usedIn' && v === '')
);

if (keys.length) {
  writeJson(reviewFile, review);
  console.log(
    `\n${keys.length} key(s) missing in Tolgee, written to ${relative(root, reviewFile)}`
  );
  for (const key of keys) {
    const langs = Object.keys(review[key]).filter((k) => k !== '_usedIn');
    console.log(`  ${key}  [${langs.join(', ')}]`);
  }
  if (empty.length) {
    console.log(
      `\n${empty.length} of them still need a value; fill them in before pushing.`
    );
  }
  console.log('\nReview the file, then run: npm run i18n:push-missing');
} else {
  console.log('\nTolgee has every key the code uses ✓');
}

if (unmatched.length) {
  console.log(
    '\nDynamic keys Tolgee has no match for (add these by hand in Tolgee):'
  );
  for (const [template, places] of unmatched) {
    console.log(`  \`${template}\`\n      ${places[0]}`);
  }
}
