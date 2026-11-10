import { reflectComponentType, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { FeatureToggleService } from '@cv/shared-data-access';
import { ROUTES } from '@cv/shared-util-routing';
import { showcaseFeatureShellRoutes } from './lib.routes';

const SHOWCASE_TOGGLES = [
  'showcase-micro-frontends',
  'showcase-lighthouse',
  'showcase-feature-toggles',
] as const;
type ShowcaseToggle = (typeof SHOWCASE_TOGGLES)[number];

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

  describe('redirects', () => {
    function configure(states: Partial<Record<ShowcaseToggle, boolean>>) {
      TestBed.configureTestingModule({
        providers: [
          provideRouter(showcaseFeatureShellRoutes),
          provideI18nTesting(),
        ],
      });
      const toggles = TestBed.inject(FeatureToggleService);
      for (const toggle of SHOWCASE_TOGGLES) {
        toggles.change(toggle, states[toggle] ?? true);
      }
    }

    it('opens the first page that is switched on', async () => {
      // Arrange
      configure({ 'showcase-micro-frontends': false });

      // Act
      await RouterTestingHarness.create('/');

      // Assert
      expect(TestBed.inject(Router).url).toBe('/lighthouse');
    });

    it('falls back to the micro-frontends page when every page is off', async () => {
      // Arrange
      configure({
        'showcase-micro-frontends': false,
        'showcase-lighthouse': false,
        'showcase-feature-toggles': false,
      });

      // Act
      await RouterTestingHarness.create('/');

      // Assert
      expect(TestBed.inject(Router).url).toBe('/micro-frontends');
    });

    it('sends an unknown url to the first page that is switched on', async () => {
      // Arrange
      configure({ 'showcase-micro-frontends': false });

      // Act
      await RouterTestingHarness.create('/does-not-exist');

      // Assert
      expect(TestBed.inject(Router).url).toBe('/lighthouse');
    });

    it('sends the old admin url to the feature toggles page', async () => {
      // Arrange
      configure({});

      // Act
      const harness = await RouterTestingHarness.create('/admin');
      const element: HTMLElement = harness.fixture.nativeElement;

      // Assert
      expect(TestBed.inject(Router).url).toBe('/feature-toggles');
      expect(element.querySelector('showcase-feature-toggles')).not.toBeNull();
    });
  });

  it.each([
    [ROUTES.SHOWCASE.MICRO_FRONTENDS, 'showcase-micro-frontends'],
    [ROUTES.SHOWCASE.LIGHTHOUSE, 'showcase-lighthouse-report'],
    [ROUTES.SHOWCASE.FEATURE_TOGGLES, 'showcase-feature-toggles'],
  ])('lazy loads the "%s" page as <%s>', async (path, selector) => {
    // Arrange
    const route = showcaseFeatureShellRoutes[0].children?.find(
      (child) => child.path === path
    );

    // Act
    const component = (await route?.loadComponent?.()) as Type<unknown>;

    // Assert
    expect(reflectComponentType(component)?.selector).toBe(selector);
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
