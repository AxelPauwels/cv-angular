// Audits every page of the deployed app with Google Lighthouse (desktop) and writes
// the four category scores to the Showcase's Lighthouse page:
//   npx nx run showcase-feature-lighthouse:audit
//   npx nx run showcase-feature-lighthouse:audit --url=https://my-preview.web.app
// Needs Google Chrome; Lighthouse itself runs through npx, it is no dependency.
// Keep PAGES in sync with LIGHTHOUSE_SECTIONS in the lib's lighthouse-pages.ts.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const LIGHTHOUSE = 'lighthouse@13.6.0';
const OUTPUT =
  'libs/showcase/feature-lighthouse/src/lib/internal/lighthouse-scores.json';
const PAGES = [
  '/home',
  '/personal',
  '/education',
  '/experience',
  '/skills',
  '/references',
  '/technical/architecture',
  '/technical/project-graph',
  '/technical/graphql-docs',
  '/technical/code-coverage',
  '/technical/end-to-end-tests',
  '/technical/versions',
  '/showcase/micro-frontends',
  '/showcase/lighthouse',
  '/showcase/admin',
];

const urlArg = process.argv.find((arg) => arg.startsWith('--url='));
const baseUrl = new URL(urlArg?.slice(6) ?? 'https://axel-pauwels.web.app')
  .origin;
const dir = mkdtempSync(join(tmpdir(), 'lighthouse-'));
const pages = {};
let run;

try {
  for (const path of PAGES) {
    const file = join(dir, 'report.json');
    console.log(`Auditing ${baseUrl}${path}`);
    execFileSync(
      'npx',
      [
        '-y',
        LIGHTHOUSE,
        `${baseUrl}${path}`,
        '--preset=desktop',
        '--only-categories=performance,accessibility,best-practices,seo',
        '--output=json',
        `--output-path=${file}`,
        '--chrome-flags=--headless=new',
        '--quiet',
      ],
      { stdio: 'inherit' }
    );
    const report = JSON.parse(readFileSync(file, 'utf8'));
    const score = (id) => Math.round((report.categories[id]?.score ?? 0) * 100);
    pages[path] = {
      performance: score('performance'),
      accessibility: score('accessibility'),
      'best-practices': score('best-practices'),
      seo: score('seo'),
    };
    run ??= {
      url: baseUrl,
      fetchTime: report.fetchTime,
      lighthouseVersion: report.lighthouseVersion,
      formFactor: report.configSettings.formFactor,
    };
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}

writeFileSync(OUTPUT, `${JSON.stringify({ ...run, pages }, null, 2)}\n`);
console.log(`Wrote ${OUTPUT}`);
