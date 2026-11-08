#!/usr/bin/env node
/**
 * Checks the translation keys in the code against the local language files
 * (libs/shared/data-access-i18n/src/i18n/*.json). Read-only, nothing is written.
 *
 * A key is any string literal starting with `t.` in a .ts or .html file under apps/
 * or libs/ (spec files excluded), e.g. 't.nav.cv' | translate or labelKey: 't.nav.cv'.
 * A key may also name a group (const ABOUT_ME = 't.personal.about-me.card' used as a
 * prefix). Template literals like `t.tour.step.${id}.title` and prefixes the code
 * completes ('t.country.' + country) are checked as patterns: at least one key per
 * language has to match. TypeScript types like `t.nav.${string}` are ignored.
 * Every key in the language files must also exist in all languages with a real value.
 *
 * Usage:
 *   node scripts/tolgee/check.mjs            report missing and untranslated keys
 *   node scripts/tolgee/check.mjs --unused   also list keys no code refers to
 *
 * Exits with 1 when something is missing or untranslated, so it can run in CI.
 * To compare against Tolgee instead and fix what is missing, use `npm run i18n:missing`.
 */
import {
  has,
  isUntranslated,
  readLanguages,
  scanCode,
  toPattern,
} from './lib.mjs';

const showUnused = process.argv.includes('--unused');
const { used, dynamic } = scanCode();
const languages = readLanguages();

const section = (title, rows) => {
  if (rows.length === 0) return;
  console.log(`\n${title} (${rows.length})`);
  for (const row of rows) console.log(row);
};
const at = (places) =>
  places
    ? `\n      ${places[0]}${places.length > 1 ? ` (+${places.length - 1} more)` : ''}`
    : '';
const codes = (langs) => `[${langs.map((l) => l.code).join(', ')}]`;

// Keys used in the code plus every key in any language file
const allKeys = new Set([
  ...used.keys(),
  ...languages.flatMap((l) => [...l.keys.keys()]),
]);
const missingRows = [];
const untranslatedRows = [];
for (const key of [...allKeys].sort()) {
  const places = used.get(key);
  const missing = languages.filter((lang) => !has(lang, key));
  const untranslated = languages.filter(
    (lang) => lang.keys.has(key) && isUntranslated(key, lang.keys.get(key))
  );
  if (missing.length)
    missingRows.push(`  ${key}  ${codes(missing)}${at(places)}`);
  if (untranslated.length)
    untranslatedRows.push(`  ${key}  ${codes(untranslated)}${at(places)}`);
}

const dynamicRows = [];
const patterns = [...dynamic.keys()].map(toPattern);
for (const [template, places] of dynamic) {
  const pattern = toPattern(template);
  const none = languages.filter(
    (lang) => ![...lang.keys.keys()].some((key) => pattern.test(key))
  );
  if (none.length)
    dynamicRows.push(`  \`${template}\`  ${codes(none)}${at(places)}`);
}

section(
  'Missing keys (code refers to them, or another language has them)',
  missingRows
);
section('Untranslated keys (empty or equal to the key)', untranslatedRows);
section('Dynamic keys without any match', dynamicRows);
const problems =
  missingRows.length + untranslatedRows.length + dynamicRows.length;

if (showUnused) {
  const prefixes = [...used.keys()].map((key) => `${key}.`);
  const unused = [...allKeys]
    .filter(
      (key) =>
        !used.has(key) &&
        !prefixes.some((prefix) => key.startsWith(prefix)) &&
        !patterns.some((pattern) => pattern.test(key))
    )
    .sort();
  section(
    'Unused keys (no code refers to them)',
    unused.map((key) => `  ${key}`)
  );
}

console.log(
  `\n${used.size} keys and ${dynamic.size} dynamic keys checked against ${languages
    .map((l) => l.code)
    .join(', ')}: ${problems ? `${problems} problem(s)` : 'all translated ✓'}`
);
process.exit(problems ? 1 : 0);
