#!/usr/bin/env node
/**
 * Merges the coverage of every project into one static HTML report, so the
 * Code coverage page in production shows what all the tests cover, not only
 * what the cv app's own tests happen to run.
 *
 * Every test run with `--coverage` writes coverage/<project>/coverage-final.json.
 * This script combines them (a line counts as covered when any project's tests
 * ran it) and writes the report to coverage/all, which the cv build copies to
 * /coverage (see apps/cv/project.json).
 *
 * The paths in those files are absolute, and a run restored from the Nx cache
 * may come from another machine, so each path is rebased onto this workspace.
 *
 * Usage: node scripts/coverage/merge.mjs   (after the tests ran with --coverage)
 */
import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import libCoverage from 'istanbul-lib-coverage';
import libReport from 'istanbul-lib-report';
import reports from 'istanbul-reports';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const coverageDir = join(root, 'coverage');
const outputName = 'all';
const outputDir = join(coverageDir, outputName);

/** The source folders of the workspace; anything else is left out */
const SOURCE_PATH = /(?:^|[\\/])((?:apps|libs|packages)[\\/].+)$/;

/** `/elsewhere/cv-angular/libs/x.ts` -> `<this workspace>/libs/x.ts` */
function rebase(path) {
  const own = relative(root, path);
  if (!own.startsWith('..') && SOURCE_PATH.test(own)) {
    return join(root, own);
  }
  const match = path.match(SOURCE_PATH);
  return match ? join(root, match[1]) : undefined;
}

const files = existsSync(coverageDir)
  ? readdirSync(coverageDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name !== outputName)
      .map((entry) => join(coverageDir, entry.name, 'coverage-final.json'))
      .filter(existsSync)
  : [];

if (files.length === 0) {
  console.error(
    'No coverage found: run the tests with coverage first, e.g.\n' +
      '  npx nx run-many -t test --all --configuration=ci --coverage'
  );
  process.exit(1);
}

const map = libCoverage.createCoverageMap({});
let skipped = 0;
for (const file of files) {
  const data = JSON.parse(readFileSync(file, 'utf8'));
  for (const [path, fileCoverage] of Object.entries(data)) {
    const target = rebase(path);
    // a source file that is gone (renamed or deleted since a cached run)
    if (!target || !existsSync(target)) {
      skipped++;
      continue;
    }
    map.merge({ [target]: { ...fileCoverage, path: target } });
  }
}

rmSync(outputDir, { recursive: true, force: true });
const context = libReport.createContext({
  dir: outputDir,
  coverageMap: map,
  defaultSummarizer: 'pkg',
});
for (const reporter of ['html', 'json-summary', 'text-summary']) {
  reports.create(reporter).execute(context);
}

console.log(
  `\nMerged ${files.length} project report(s), ${map.files().length} source files` +
    (skipped ? ` (${skipped} entries without a source file skipped)` : '') +
    `:\n  ${relative(root, outputDir)}${sep}index.html`
);
