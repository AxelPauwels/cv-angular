/**
 * Shared helpers for the i18n scripts: finding translation keys in the code, reading
 * language files and talking to Tolgee through its CLI (configured in .tolgeerc.json).
 */
import { spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, relative } from 'node:path';

export const root = join(import.meta.dirname, '../..');
export const i18nDir = join(root, 'libs/shared/data-access-i18n/src/i18n');
/** The file `i18n:missing` writes and `i18n:push-missing` reads; gitignored */
export const reviewFile = join(root, 'scripts/tolgee/i18n-missing-keys.json');

const sourceDirs = ['apps', 'libs'];
const skipDirs = new Set([
  'node_modules',
  'dist',
  '__screenshots__',
  '.angular',
]);

// 't.a.b', "t.a.b" or `t.a.b`: two or more segments after `t`
const staticKey = /(['"`])(t(?:\.[\w-]+)+)\1/g;
// `t.a.${x}.b`
const dynamicKey = /`(t\.[^`]*\$\{[^`]*)`/g;
// 't.a.' + x: a prefix the code completes, checked like `t.a.${x}`
const prefixKey = /(['"`])(t(?:\.[\w-]+)*\.)\1/g;

function* sourceFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name)) yield* sourceFiles(path);
    } else if (
      /\.(ts|html)$/.test(entry.name) &&
      !/\.spec\.ts$/.test(entry.name)
    ) {
      yield path;
    }
  }
}

/** `t.nav.${string}` is a TypeScript template literal type, not a key */
const isTypeOnly = (template) =>
  [...template.matchAll(/\$\{([^}]*)\}/g)].every((m) =>
    /^\s*(string|number)\s*$/.test(m[1])
  );

const lineOf = (text, index) => text.slice(0, index).split('\n').length;

const append = (map, key, value) =>
  map.set(key, [...(map.get(key) ?? []), value]);

/**
 * The keys in the code (.ts and .html under apps/ and libs/, specs excluded):
 * `used` are literal keys, `dynamic` templates like `t.tour.step.${id}.title` or
 * prefixes like 't.country.' + x. Both map to where they are used ('file:line').
 */
export function scanCode() {
  const used = new Map();
  const dynamic = new Map();
  for (const dir of sourceDirs) {
    for (const file of sourceFiles(join(root, dir))) {
      const text = readFileSync(file, 'utf8');
      const where = (index) => `${relative(root, file)}:${lineOf(text, index)}`;
      for (const match of text.matchAll(staticKey)) {
        append(used, match[2], where(match.index));
      }
      for (const match of text.matchAll(prefixKey)) {
        append(dynamic, `${match[2]}\${…}`, where(match.index));
      }
      for (const match of text.matchAll(dynamicKey)) {
        if (!isTypeOnly(match[1]))
          append(dynamic, match[1], where(match.index));
      }
    }
  }
  return { used, dynamic };
}

/** `t.tour.step.${id}.title` -> /^t\.tour\.step\..+\.title$/ */
export function toPattern(template) {
  const parts = template
    .split(/\$\{[^}]*\}/)
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`^${parts.join('.+')}$`);
}

/** { t: { nav: { cv: 'CV' } } } -> keys: Map { 't.nav.cv' => 'CV' }, groups: Set { 't', 't.nav' } */
function flatten(
  object,
  prefix = '',
  into = { keys: new Map(), groups: new Set() }
) {
  for (const [key, value] of Object.entries(object)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object') {
      into.groups.add(path);
      flatten(value, path, into);
    } else {
      into.keys.set(path, value);
    }
  }
  return into;
}

/** [{ code: 'en', keys, groups }] for every <code>.json in `dir`, sorted by code */
export function readLanguages(dir = i18nDir) {
  return readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => ({
      code: basename(name, '.json'),
      ...flatten(JSON.parse(readFileSync(join(dir, name), 'utf8'))),
    }));
}

/** The language has the key, or uses it as a group (a prefix the code completes) */
export const has = (lang, key) => lang.keys.has(key) || lang.groups.has(key);

/** A value that is empty or the key itself is a placeholder, not a translation */
export const isUntranslated = (key, value) =>
  value === undefined ||
  value === null ||
  String(value).trim() === '' ||
  value === key;

/**
 * Sets 't.a.b' in a nested object; sorts the object the key lands in.
 *
 * A key can be both a value and the start of others ('t.x' and 't.x.description'):
 * those stay side by side as dotted keys ({ "x": "…", "x.description": "…" }), the
 * way the language files hold them, instead of one replacing the other.
 */
export function setNested(object, key, value) {
  const parts = key.split('.');
  let node = object;
  while (parts.length > 1) {
    const next = node[parts[0]];
    if (typeof next === 'string') break; // the rest stays one dotted key
    if (next === undefined) node[parts[0]] = {};
    node = node[parts.shift()];
  }
  const leaf = parts.join('.');
  const existing = node[leaf];
  if (existing && typeof existing === 'object' && typeof value === 'string') {
    // 't.x.description' came first: keep what is under 't.x' as dotted keys
    delete node[leaf];
    const flatten = (group, prefix) => {
      for (const [child, childValue] of Object.entries(group)) {
        if (childValue && typeof childValue === 'object') {
          flatten(childValue, `${prefix}.${child}`);
        } else {
          node[`${prefix}.${child}`] = childValue;
        }
      }
    };
    flatten(existing, leaf);
  }
  node[leaf] = value;
  const sorted = Object.entries(node).sort(([a], [b]) => a.localeCompare(b));
  for (const [k] of sorted) delete node[k];
  Object.assign(node, Object.fromEntries(sorted));
}

export const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
export const writeJson = (path, data) =>
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);

function tolgee(args) {
  const result = spawnSync(join(root, 'node_modules/.bin/tolgee'), args, {
    cwd: root,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    throw new Error(`tolgee ${args[0]} failed (exit ${result.status})`);
  }
}

/** Pulls the current Tolgee translations into a temporary folder and reads them */
export function pullTolgee() {
  const dir = mkdtempSync(join(tmpdir(), 'tolgee-pull-'));
  try {
    tolgee(['pull', '--path', dir]);
    return readLanguages(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Pushes { en: { 't.a.b': 'value' }, nl: {...} } to Tolgee. Only these keys are sent,
 * and existing translations in Tolgee are kept (force mode KEEP).
 */
export function pushTolgee(byLanguage) {
  const dir = mkdtempSync(join(tmpdir(), 'tolgee-push-'));
  try {
    for (const [code, entries] of Object.entries(byLanguage)) {
      const nested = {};
      for (const [key, value] of Object.entries(entries)) {
        setNested(nested, key, value);
      }
      writeJson(join(dir, `${code}.json`), nested);
    }
    tolgee([
      'push',
      '--files-template',
      join(dir, '{languageTag}.json'),
      '--force-mode',
      'KEEP',
    ]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
