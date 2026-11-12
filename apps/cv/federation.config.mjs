import {
  withNativeFederation,
  fromPackageJson,
} from '@angular-architects/native-federation/config';

export default withNativeFederation({
  name: 'cv',

  shared: fromPackageJson({
    singleton: true,
    strictVersion: true,
    requiredVersion: 'auto',
    build: 'package',
  })
    .patch(['@angular/*'], { includeSecondaries: { keepAll: true } })
    .get(),

  // Workspace libs (@cv/*) are bundled into the app, not shared: no remote
  // uses them. Sharing them gave @cv/shared-ui-federation its own copy of the
  // federation runtime, whose loadRemoteModule never resolved (initFederation
  // only initializes the app's copy), so /cv-mfe stayed empty.
  sharedMappings: [],

  // To share workspace libs with a remote in this workspace later:
  // sharedMappings: mappingsFromWorkspace({ singleton: true })
  //   .filter(['@mfe/*'])
  //   .get(),

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    // Add further packages you don't need at runtime
    '@schematics/angular',
    /^@angular-devkit\//,
    /^@nx\//,
    'source-map-support',
    '@softarc/native-federation-node',
    // keepAll publishes every secondary entry point of @angular/*, including
    // Node-only schematics and test harnesses that can't be bundled for the browser
    /^@angular\/[^/]+\/schematics(\/|$)/,
    /^@angular\/[^/]+(\/.*)?\/testing(\/|$)/,
    // In-browser GraphQL API: bundled into the app, not shared
    'graphql',
    /^@graphql-tools\//,
    // Tolgee: bundled into the app, not shared (no remote uses it). Shared, it
    // was prebuilt as a whole package with its development entry, so production
    // shipped the in-context editor (React + MUI, ~300 kB gzipped) on the
    // critical path
    /^@tolgee\//,
  ],

  // Please read our FAQ about sharing libs:
  // https://shorturl.at/jmzH0

  features: {
    ignoreUnusedDeps: true,
    denseExternals: true,
  },
});
