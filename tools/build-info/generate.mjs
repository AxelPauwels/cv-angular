/**
 * Writes the data behind Technical > Versions and Architecture, as JSON the
 * app loads at runtime (copied into the build at /build-info):
 *
 * - versions.json: installed versions of the main frameworks and tools
 * - architecture.json: every project with its domain, layer and dependencies
 *   (Nx project graph) and the dependency rules (sheriff.config.ts)
 *
 * Run with `nx run technical-data-access-build-info:build-info`.
 */
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createProjectGraphAsync } from '@nx/devkit';
import { sameTag } from '@softarc/sheriff-core';

const root = resolve(import.meta.dirname, '../..');
const outDir = join(root, 'dist/.build-info');

/** The packages worth showing, grouped; anything not installed is skipped */
const PACKAGES = [
  ['Framework', '@angular/core', 'Angular'],
  ['Framework', 'typescript', 'TypeScript'],
  ['Framework', 'rxjs', 'RxJS'],
  ['UI', '@angular/material', 'Angular Material'],
  ['UI', '@angular/cdk', 'Angular CDK'],
  ['UI', '@angular/elements', 'Angular Elements'],
  ['State', '@ngrx/signals', 'NgRx Signals'],
  [
    'Micro-frontends',
    '@angular-architects/native-federation',
    'Native Federation',
  ],
  ['API', 'graphql', 'GraphQL'],
  ['API', '@graphql-tools/schema', 'GraphQL Tools'],
  ['API', '@graphql-codegen/cli', 'GraphQL Code Generator'],
  ['API', 'spectaql', 'SpectaQL'],
  ['i18n', '@tolgee/ngx', 'Tolgee'],
  ['Monorepo', 'nx', 'Nx'],
  ['Architecture', '@softarc/sheriff-core', 'Sheriff'],
  ['Architecture', '@softarc/detective', 'Detective'],
  ['Testing', 'vitest', 'Vitest'],
  ['Testing', '@playwright/test', 'Playwright'],
  ['Code quality', 'eslint', 'ESLint'],
  ['Code quality', 'stylelint', 'Stylelint'],
  ['Code quality', 'prettier', 'Prettier'],
];

function installedVersion(name) {
  try {
    const file = join(root, 'node_modules', name, 'package.json');
    return JSON.parse(readFileSync(file, 'utf8')).version;
  } catch {
    return undefined;
  }
}

function versions() {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const declared = { ...pkg.dependencies, ...pkg.devDependencies };
  const packages = PACKAGES.map(([category, name, label]) => ({
    category,
    name,
    label,
    version: installedVersion(name),
    range: declared[name],
  })).filter((entry) => entry.version);
  const runtime = [
    {
      category: 'Runtime',
      name: 'node',
      label: 'Node.js',
      version: process.versions.node,
    },
    {
      category: 'Runtime',
      name: 'npm',
      label: 'npm',
      version: execSync('npm -v').toString().trim(),
    },
  ];
  return { packages: [...runtime, ...packages] };
}

const tagValue = (tags, prefix) =>
  tags.find((tag) => tag.startsWith(`${prefix}:`))?.slice(prefix.length + 1);

async function architecture() {
  const graph = await createProjectGraphAsync();
  const projects = Object.values(graph.nodes)
    // the workspace root itself is not a project of the app
    .filter((node) => node.data.root !== '.')
    .map((node) => ({
      name: node.name,
      root: node.data.root,
      kind: node.type === 'app' || node.type === 'e2e' ? node.type : 'lib',
      domain: tagValue(node.data.tags ?? [], 'domain'),
      layer: tagValue(node.data.tags ?? [], 'type'),
      dependencies: (graph.dependencies[node.name] ?? [])
        .map((dependency) => dependency.target)
        // only workspace projects: npm packages live in graph.externalNodes
        .filter((target) => target in graph.nodes)
        .filter((target) => graph.nodes[target].data.root !== '.')
        .filter((target, index, all) => all.indexOf(target) === index)
        .sort(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const { config } = await import(
    pathToFileURL(join(root, 'sheriff.config.ts')).href
  );
  const rules = Object.entries(config.depRules).map(([from, to]) => ({
    from,
    to: (Array.isArray(to) ? to : [to]).map((target) =>
      target === sameTag
        ? 'same domain'
        : typeof target === 'string'
          ? target
          : 'custom rule'
    ),
  }));

  return { projects, rules };
}

mkdirSync(outDir, { recursive: true });
writeFileSync(
  join(outDir, 'versions.json'),
  JSON.stringify(versions(), null, 2)
);
writeFileSync(
  join(outDir, 'architecture.json'),
  JSON.stringify(await architecture(), null, 2)
);
console.log(`Build info written to ${outDir}`);
