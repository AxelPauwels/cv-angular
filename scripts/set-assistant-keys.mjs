#!/usr/bin/env node
/**
 * Writes the AI assistant's Firebase AI Logic keys from the env variables
 * FIREBASE_API_KEY, FIREBASE_APP_ID and RECAPTCHA_SITE_KEY (GitHub secrets in
 * CI) into the FIREBASE_ASSISTANT export of the tokens file, for the
 * production build.
 *
 * The keys are public by design (they end up in the bundle; App Check guards
 * their use) but stay out of the repo. They are read from the environment, not
 * from the command line, so they never show up in a process list or the CI log.
 *
 * Usage: FIREBASE_API_KEY=... FIREBASE_APP_ID=... RECAPTCHA_SITE_KEY=... \
 *   node scripts/set-assistant-keys.mjs <tokens file>
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [file] = process.argv.slice(2);

const KEYS = [
  {
    name: 'API_KEY',
    env: 'FIREBASE_API_KEY',
    format: /^AIza[0-9A-Za-z_-]{35}$/,
  },
  { name: 'APP_ID', env: 'FIREBASE_APP_ID', format: /^\d+:\d+:web:[0-9a-f]+$/ },
  {
    name: 'RECAPTCHA_SITE_KEY',
    env: 'RECAPTCHA_SITE_KEY',
    format: /^[0-9A-Za-z_-]{40}$/,
  },
];

// Anything that doesn't look like the key (a placeholder, a typo) is left out:
// the site still deploys, only the assistant says it is switched off
const values = KEYS.map(({ env, format }) => ({
  env,
  value: process.env[env] ?? '',
  valid: format.test(process.env[env] ?? ''),
}));
const invalid = values.filter(({ valid }) => !valid).map(({ env }) => env);
if (invalid.length) {
  console.warn(
    `⚠️  ${invalid.join(', ')} not set or not valid: keys left out, the AI assistant is switched off`
  );
  process.exit(0);
}

let source = readFileSync(file, 'utf8');
for (const [index, { name }] of KEYS.entries()) {
  const pattern = new RegExp(
    `(export const FIREBASE_ASSISTANT = \\{[^}]*?${name}: )'[^']*'`
  );
  if (!pattern.test(source)) {
    console.error(`No FIREBASE_ASSISTANT export with ${name} in ${file}`);
    process.exit(1);
  }
  source = source.replace(pattern, `$1'${values[index].value}'`);
}
writeFileSync(file, source);
