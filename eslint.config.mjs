import nx from '@nx/eslint-plugin';
import sheriff from '@softarc/eslint-plugin-sheriff';
import { sharedConfig } from './tools/eslint/shared-config.mjs';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  ...sharedConfig,
  {
    ignores: ['**/dist'],
  },
  // dependency rules and `internal` encapsulation from sheriff.config.ts
  sheriff.configs.all,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          // libs are buildable only so the Angular Vitest runner has a build target;
          // the app compiles them from source, so they may use non-buildable libs (cv-api)
          enforceBuildableLibDependency: false,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          // dependency rules between domains and types live in sheriff.config.ts;
          // this rule still checks lazy-loaded, relative, circular and deep imports
          depConstraints: [{ sourceTag: '*', onlyDependOnLibsWithTags: ['*'] }],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];
