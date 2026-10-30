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
  ],

  // Please read our FAQ about sharing libs:
  // https://shorturl.at/jmzH0

  features: {
    ignoreUnusedDeps: true,
    denseExternals: true,
  },
});
