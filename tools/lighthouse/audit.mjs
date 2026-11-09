// Audits every page of the deployed app with Google Lighthouse (desktop) and writes
// the four category scores to the Showcase's Lighthouse page:
//   npx nx run showcase-feature-lighthouse:audit
//   npx nx run showcase-feature-lighthouse:audit --url=https://my-preview.web.app
//   npx nx run showcase-feature-lighthouse:audit --runs=5
//
// Where Lighthouse runs matters more than which URL it loads: the desktop preset does
// not throttle the CPU, so a busy or slow laptop drags Performance down. With
// PSI_API_KEY set (in the gitignored .env), the audit runs on Google's PageSpeed
// Insights servers instead, which gives stable, comparable scores. Without it, it falls
// back to a local headless Chrome (Lighthouse through npx, no dependency).
// Either way each page is audited RUNS times and the median score is kept.
// Keep PAGES in sync with LIGHTHOUSE_SECTIONS in the lib's lighthouse-pages.ts.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const LIGHTHOUSE = 'lighthouse@13.6.0';
const PSI_ENDPOINT =
  'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const PSI_CONCURRENCY = 4;
const OUTPUT =
  'libs/showcase/feature-lighthouse/src/lib/internal/lighthouse-scores.json';
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];
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
  '/showcase/feature-toggles',
];

const arg = (name) =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const baseUrl = new URL(arg('url') ?? 'https://axel-pauwels.web.app').origin;
const runs = Math.max(1, Number.parseInt(arg('runs') ?? '3', 10) || 3);
const apiKey = process.env.PSI_API_KEY?.trim();

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
};

const scoresOf = (report) =>
  Object.fromEntries(
    CATEGORIES.map((id) => [
      id,
      Math.round((report.categories[id]?.score ?? 0) * 100),
    ])
  );

async function auditWithPsi(url) {
  const query = new URLSearchParams({ url, strategy: 'desktop', key: apiKey });
  CATEGORIES.forEach((c) =>
    query.append('category', c.toUpperCase().replace('-', '_'))
  );
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(`${PSI_ENDPOINT}?${query}`);
    if (response.ok) return (await response.json()).lighthouseResult;
    const body = await response.json().catch(() => ({}));
    const message = body.error?.message ?? response.statusText;
    if (attempt >= 3 || ![429, 500, 503].includes(response.status)) {
      throw new Error(
        `PageSpeed Insights ${response.status} for ${url}: ${message}`
      );
    }
    await new Promise((r) => setTimeout(r, attempt * 5000));
  }
}

function auditLocally(url, dir) {
  const file = join(dir, 'report.json');
  execFileSync(
    'npx',
    [
      '-y',
      LIGHTHOUSE,
      url,
      '--preset=desktop',
      `--only-categories=${CATEGORIES.join(',')}`,
      '--output=json',
      `--output-path=${file}`,
      '--chrome-flags=--headless=new',
      '--quiet',
    ],
    { stdio: 'inherit' }
  );
  return JSON.parse(readFileSync(file, 'utf8'));
}

async function auditPage(path, audit) {
  const reports = [];
  for (let i = 1; i <= runs; i++) {
    console.log(`Auditing ${baseUrl}${path} (${i}/${runs})`);
    reports.push(await audit(`${baseUrl}${path}`));
  }
  const all = reports.map(scoresOf);
  const scores = Object.fromEntries(
    CATEGORIES.map((id) => [id, median(all.map((s) => s[id]))])
  );
  console.log(
    `  ${path}: ${CATEGORIES.map((id) => `${id} ${scores[id]} [${all.map((s) => s[id]).join(', ')}]`).join(' · ')}`
  );
  return { scores, report: reports[0] };
}

console.log(
  apiKey
    ? `Running on PageSpeed Insights, ${runs} run(s) per page.`
    : `PSI_API_KEY not set: running Lighthouse locally, ${runs} run(s) per page.\n` +
        'Local Performance scores depend on this machine; set PSI_API_KEY in .env for stable scores.'
);

const results = new Map();
const dir = apiKey ? undefined : mkdtempSync(join(tmpdir(), 'lighthouse-'));
try {
  if (apiKey) {
    const queue = [...PAGES];
    await Promise.all(
      Array.from({ length: PSI_CONCURRENCY }, async () => {
        for (let path; (path = queue.shift());) {
          results.set(path, await auditPage(path, auditWithPsi));
        }
      })
    );
  } else {
    // Local runs stay sequential: parallel Chrome instances would skew Performance.
    for (const path of PAGES) {
      results.set(path, await auditPage(path, (url) => auditLocally(url, dir)));
    }
  }
} finally {
  if (dir) rmSync(dir, { recursive: true, force: true });
}

const first = results.get(PAGES[0]).report;
const output = {
  url: baseUrl,
  fetchTime: first.fetchTime,
  lighthouseVersion: first.lighthouseVersion,
  formFactor: first.configSettings.formFactor,
  pages: Object.fromEntries(PAGES.map((p) => [p, results.get(p).scores])),
};
writeFileSync(OUTPUT, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${OUTPUT}`);
