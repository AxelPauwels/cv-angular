import {
  EnvironmentProviders,
  InjectionToken,
  makeEnvironmentProviders,
} from '@angular/core';

export interface ContactConfig {
  web3formsAccessKey: string;
}

export const CONTACT_CONFIG = new InjectionToken<ContactConfig>(
  'CONTACT_CONFIG',
  { factory: () => ({ web3formsAccessKey: '' }) }
);

export function provideContact(config: ContactConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: CONTACT_CONFIG, useValue: config },
  ]);
}
