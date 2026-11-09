import { TestBed } from '@angular/core/testing';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { FeatureToggleService } from '@cv/shared-data-access';
import { showcaseFeatureShellRoutes } from './lib.routes';

describe('showcaseFeatureShellRoutes', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('opens the first sub item and lists all sub items', async () => {
    // Arrange: both on, whatever the defaults
    TestBed.configureTestingModule({
      providers: [
        provideRouter(showcaseFeatureShellRoutes),
        provideI18nTesting(),
      ],
    });
    const toggles = TestBed.inject(FeatureToggleService);
    toggles.change('showcase-micro-frontends', true);
    toggles.change('showcase-lighthouse', true);
    toggles.change('showcase-feature-toggles', true);

    // Act
    const harness = await RouterTestingHarness.create('/');
    const element: HTMLElement = harness.fixture.nativeElement;

    // Assert
    expect(TestBed.inject(Router).url).toBe('/micro-frontends');
    expect(
      Array.from(element.querySelectorAll('ds-sub-navbar > nav a')).map(
        (link) => link.textContent?.trim()
      )
    ).toEqual(['Micro-frontends', 'Lighthouse', 'Feature toggles']);
  });

  it('keeps the feature toggles page reachable when its menu item is switched off', async () => {
    // Arrange
    TestBed.configureTestingModule({
      providers: [
        provideRouter(showcaseFeatureShellRoutes),
        provideI18nTesting(),
      ],
    });
    const toggles = TestBed.inject(FeatureToggleService);
    toggles.change('showcase-micro-frontends', true);
    toggles.change('showcase-lighthouse', false);
    toggles.change('showcase-feature-toggles', false);

    // Act
    const harness = await RouterTestingHarness.create('/feature-toggles');
    const element: HTMLElement = harness.fixture.nativeElement;

    // Assert
    expect(TestBed.inject(Router).url).toBe('/feature-toggles');
    expect(
      Array.from(element.querySelectorAll('ds-sub-navbar > nav a')).map(
        (link) => link.textContent?.trim()
      )
    ).toEqual(['Micro-frontends']);
  });

  it('lazy loads a standalone component for every page', async () => {
    // Arrange
    const pages = showcaseFeatureShellRoutes[0].children?.filter(
      (route) => route.loadComponent
    );

    // Act
    const components = await Promise.all(
      pages?.map((route) => route.loadComponent?.()) ?? []
    );

    // Assert
    expect(components.length).toBeGreaterThan(0);
    for (const component of components) {
      expect(component).toEqual(expect.any(Function));
    }
  });
});
