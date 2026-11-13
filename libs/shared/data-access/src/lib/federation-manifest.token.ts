import { InjectionToken } from '@angular/core';

/**
 * The federation manifest the app was started with (remote name →
 * remoteEntry.json), e.g. for the versions page to ask each remote for its
 * version.
 * The app provides its environment's manifest; production's is the default.
 */
export const FEDERATION_MANIFEST_URL = new InjectionToken<string>(
  'FEDERATION_MANIFEST_URL',
  { providedIn: 'root', factory: () => 'federation.manifest.json' }
);
