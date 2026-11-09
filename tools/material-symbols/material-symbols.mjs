// Keeps the Material Symbols font in apps/cv/src/index.html down to the icons the app
// uses. The full font is ~290 KiB and blocks every icon until it has loaded; with
// `icon_names` Google serves a subset of a few KiB. The catch: an icon missing from the
// list renders as its name ("arrow_back") instead of a glyph, so this script finds the
// names in the code and checks (default) or rewrites (--write) the URL.
//   npx nx run cv:material-symbols          fails when the URL is out of date
//   npx nx run cv:material-symbols:write    updates the URL
//
// Where it looks (outside spec and generated files):
// - HTML: the text of <mat-icon fontSet="material-symbols-outlined"> (a bare name, or
//   the quoted names in an expression such as `open() ? 'close' : 'menu'`), a static
//   icon="…" on any element (ds-card, ds-timeline-detail, …), and the quoted names in
//   a bound [icon]="…" expression.
// - TS: quoted names on an `icon:` line and the values of a `*_ICONS` map.
// libs/api is skipped: its icons belong to the cv icon font. A few extra names (for
// example a cv icon that shares an `icon:` key) only add a glyph each; unknown names
// are ignored by Google.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const INDEX = 'apps/cv/src/index.html';
const ROOTS = ['apps/cv/src', 'libs'];
const SKIP = [/\.spec\.ts$/, /\/generated\//, /^libs\/api\//, /node_modules/];
const NAME = /^[a-z][a-z0-9_]*$/;
const QUOTED = /'([a-z][a-z0-9_]*)'/g;
const FONT_URL =
  /https:\/\/fonts\.googleapis\.com\/css2\?family=Material\+Symbols\+Outlined[^"]*/;

const files = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (SKIP.some((re) => re.test(path))) return [];
    return entry.isDirectory() ? files(path) : [path];
  });

const quoted = (text) => [...text.matchAll(QUOTED)].map((m) => m[1]);

const fromHtml = (html) => {
  const names = [];
  for (const [, attrs, body] of html.matchAll(
    /<mat-icon\b((?:[^>"]|"[^"]*")*)>([\s\S]*?)<\/mat-icon/g
  )) {
    if (!attrs.includes('material-symbols-outlined')) continue;
    const text = body.trim();
    if (NAME.test(text)) names.push(text);
    names.push(...quoted(text));
  }
  for (const [, icon] of html.matchAll(/\sicon="([a-z][a-z0-9_]*)"/g)) {
    names.push(icon);
  }
  // Bound inputs: [icon]="degree ? 'workspace_premium' : undefined"
  for (const [, expression] of html.matchAll(/\[\w*[iI]con\]="([^"]*)"/g)) {
    names.push(...quoted(expression));
  }
  return names;
};

const fromTs = (ts) => {
  const names = [];
  for (const [line] of ts.matchAll(/\bicon\??\s*:[^\n]*/g)) {
    names.push(...quoted(line));
  }
  for (const [, body] of ts.matchAll(/_ICONS\b[^=]*=\s*\{([\s\S]*?)\}/g)) {
    names.push(...quoted(body));
  }
  return names;
};

const names = [
  ...new Set(
    ROOTS.flatMap(files).flatMap((path) => {
      if (path.endsWith('.html')) return fromHtml(readFileSync(path, 'utf8'));
      if (path.endsWith('.ts')) return fromTs(readFileSync(path, 'utf8'));
      return [];
    })
  ),
].sort();

// Google requires icon_names in alphabetical order. The axes are pinned to the
// defaults the app renders (24px optical size, weight 400, outlined, grade 0).
const url =
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0' +
  `&icon_names=${names.join(',')}&display=block`;

const index = readFileSync(INDEX, 'utf8');
const current = index.match(FONT_URL)?.[0];

if (process.argv.includes('--write')) {
  if (!current) {
    console.error(`No Material Symbols css2 URL found in ${INDEX}.`);
    process.exit(1);
  }
  writeFileSync(INDEX, index.replace(FONT_URL, url));
  console.log(`Material Symbols: ${names.length} icons written to ${INDEX}.`);
} else if (current !== url) {
  const listed = new Set(
    current?.match(/icon_names=([^&]*)/)?.[1].split(',') ?? []
  );
  const missing = names.filter((name) => !listed.has(name));
  console.error(
    `The Material Symbols URL in ${INDEX} is out of date` +
      (missing.length ? ` (missing: ${missing.join(', ')})` : '') +
      '.\nRun: npx nx run cv:material-symbols:write'
  );
  process.exit(1);
} else {
  console.log(`Material Symbols: ${names.length} icons, URL up to date.`);
}
