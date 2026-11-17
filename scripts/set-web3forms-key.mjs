#!/usr/bin/env node
/**
 * Writes the WEB3FORMS_ACCESS_KEY env variable (a GitHub secret in CI) into the
 * WEB3FORMS export of the tokens file, for the production build.
 *
 * The key is read from the environment, not from the command line, so it never
 * shows up in a process list or the CI log.
 *
 * Usage: WEB3FORMS_ACCESS_KEY=... node scripts/set-web3forms-key.mjs <tokens file>
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [file] = process.argv.slice(2);
const key = process.env.WEB3FORMS_ACCESS_KEY ?? '';

// Web3Forms keys are UUIDs; anything else (a placeholder, a typo) is left out:
// the site still deploys, only the contact form cannot send
if (
  !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key)
) {
  console.warn(
    '⚠️  WEB3FORMS_ACCESS_KEY is not a Web3Forms access key (a UUID): left out, the contact form cannot send'
  );
  process.exit(0);
}

const source = readFileSync(file, 'utf8');
const pattern = /(export const WEB3FORMS = \{\s*ACCESS_KEY: )'[^']*'/;
if (!pattern.test(source)) {
  console.error(`No WEB3FORMS export with an ACCESS_KEY in ${file}`);
  process.exit(1);
}
writeFileSync(file, source.replace(pattern, `$1'${key}'`));
