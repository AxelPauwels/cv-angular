/**
 * Shrinks the data file of the static Nx project graph (`nx graph --file`).
 *
 * Its static/environment.js holds the project graph (~0.4 MB) and also the
 * task plans and expanded task inputs of every target (~6 MB). Technical >
 * Project graph only shows the project view, yet the browser parses all of it
 * on load, which blocks the main thread for hundreds of milliseconds.
 * The task graph itself stays, only its plans and inputs are emptied.
 *
 * Run with `nx run @axel-pauwels/cv:project-graph` (runs `nx graph` first).
 */
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';

const root = resolve(import.meta.dirname, '../..');
const file = resolve(
  root,
  process.argv[2] ?? 'dist/.project-graph/static/environment.js'
);

const before = statSync(file).size;

// The file only assigns plain data to `window.*`: evaluate it in an empty
// context and write the same globals back as JSON
const window = {};
runInNewContext(readFileSync(file, 'utf8'), { window });

if (window.taskGraphResponse) {
  window.taskGraphResponse = { ...window.taskGraphResponse, plans: {} };
}
window.expandedTaskInputsResponse = {};

const output = Object.entries(window)
  .map(([key, value]) => `window.${key} = ${JSON.stringify(value)};`)
  .join('\n');
writeFileSync(file, `${output}\n`);

const kB = (bytes) => `${Math.round(bytes / 1024)} kB`;
console.log(
  `Project graph data: ${kB(before)} → ${kB(statSync(file).size)} (${file})`
);
