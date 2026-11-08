#!/usr/bin/env node
/**
 * Step 2 of 2: pushes the keys in the review file (from `npm run i18n:missing`) to
 * Tolgee, then adds them to the local language files too.
 *
 * Only the keys in the review file are sent, and translations that already exist in
 * Tolgee are never overwritten (force mode KEEP). Values that are still empty are
 * skipped and stay in the review file; the file is deleted once everything is pushed.
 *
 * Usage:
 *   node scripts/tolgee/push-missing.mjs             push
 *   node scripts/tolgee/push-missing.mjs --dry-run   only show what would be pushed
 */
import { existsSync, rmSync } from 'node:fs';
import { join, relative } from 'node:path';
import {
  i18nDir,
  pushTolgee,
  readJson,
  reviewFile,
  root,
  setNested,
  writeJson,
} from './lib.mjs';

const dryRun = process.argv.includes('--dry-run');
const reviewPath = relative(root, reviewFile);

if (!existsSync(reviewFile)) {
  console.log(`No ${reviewPath}; run npm run i18n:missing first.`);
  process.exit(0);
}

const review = readJson(reviewFile);
const byLanguage = {}; // { en: { 't.a.b': 'value' } }
const remaining = {}; // what stays in the review file
let count = 0;

for (const [key, entry] of Object.entries(review)) {
  for (const [code, value] of Object.entries(entry)) {
    if (code === '_usedIn') continue;
    if (typeof value === 'string' && value.trim() !== '') {
      (byLanguage[code] ??= {})[key] = value;
      count++;
    } else {
      remaining[key] ??= entry._usedIn ? { _usedIn: entry._usedIn } : {};
      remaining[key][code] = '';
    }
  }
}

if (count === 0) {
  console.log(`Nothing to push: every value in ${reviewPath} is empty.`);
  process.exit(1);
}

console.log(`${dryRun ? 'Would push' : 'Pushing'} ${count} translation(s):`);
for (const [code, entries] of Object.entries(byLanguage)) {
  for (const [key, value] of Object.entries(entries)) {
    console.log(`  ${code}  ${key}: ${JSON.stringify(value)}`);
  }
}
const skipped = Object.keys(remaining);
if (skipped.length) {
  console.log(`\nSkipped, still empty: ${skipped.join(', ')}`);
}
if (dryRun) process.exit(0);

pushTolgee(byLanguage);

// Keep the local files in line with Tolgee
for (const [code, entries] of Object.entries(byLanguage)) {
  const path = join(i18nDir, `${code}.json`);
  if (!existsSync(path)) continue;
  const data = readJson(path);
  for (const [key, value] of Object.entries(entries)) {
    setNested(data, key, value);
  }
  writeJson(path, data);
}

if (skipped.length) {
  writeJson(reviewFile, remaining);
  console.log(`\nPushed. ${skipped.length} key(s) left in ${reviewPath}.`);
} else {
  rmSync(reviewFile);
  console.log(
    `\nPushed and added to the local language files; ${reviewPath} removed.`
  );
}
