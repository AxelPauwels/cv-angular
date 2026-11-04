import { sameTag, SheriffConfig } from '@softarc/sheriff-core';

/**
 * The single source of truth for dependency rules between domains and types
 * (runs via ESLint and `sheriff verify`), plus encapsulation: files in an
 * `internal` folder are private to their module. Keep the tags in sync with
 * the Nx tags in each project.json, which Nx uses for graph and task filtering.
 *
 * Folders follow libs/<domain>/<type>-<name>; libs/shared is the shared domain.
 */
export const config: SheriffConfig = {
  enableBarrelLess: true,
  entryPoints: {
    cv: 'apps/cv/src/main.ts',
  },
  // Tags sit on each lib's src folder: its src/index.ts barrel is the module
  modules: {
    // before libs/<domain>, which would otherwise match api as a domain
    'libs/api/src': ['domain:shared', 'type:api'],
    'libs/<domain>': {
      'feature-<name>/src': ['domain:<domain>', 'type:feature'],
      'ui-<name>/src': ['domain:<domain>', 'type:ui'],
      'data-access-<name>/src': ['domain:<domain>', 'type:data-access'],
      'util-<name>/src': ['domain:<domain>', 'type:util'],
      'data-access/src': ['domain:<domain>', 'type:data-access'],
      'ui/src': ['domain:<domain>', 'type:ui'],
      'util/src': ['domain:<domain>', 'type:util'],
    },
    // publishable package: its barrel is src/public-api.ts, so the module is the package folder
    'packages/mac-window': ['domain:shared', 'type:ui'],
  },
  depRules: {
    // the app (everything outside a module) may use every module
    root: '*',
    // a domain only uses itself and shared
    'domain:*': [sameTag, 'domain:shared'],
    'type:feature': [
      'type:feature',
      'type:ui',
      'type:data-access',
      'type:api',
      'type:util',
    ],
    'type:ui': ['type:ui', 'type:util'],
    'type:data-access': ['type:data-access', 'type:api', 'type:util'],
    'type:api': [],
    'type:util': ['type:util'],
  },
};
