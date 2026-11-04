import { TestBed } from '@angular/core/testing';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { showcaseFeatureShellRoutes } from './lib.routes';

describe('showcaseFeatureShellRoutes', () => {
  it('opens the first sub item and lists all sub items', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(showcaseFeatureShellRoutes),
        provideI18nTesting(),
      ],
    });
    const harness = await RouterTestingHarness.create('/');
    const element: HTMLElement = harness.fixture.nativeElement;

    expect(TestBed.inject(Router).url).toBe('/graphql-docs');
    expect(
      Array.from(element.querySelectorAll('ds-sub-navbar > nav a')).map(
        (link) => link.textContent?.trim()
      )
    ).toEqual([
      'graphql docs',
      'code coverage',
      'End-to-end tests',
      'Micro-frontends',
    ]);
  });
});
