import { reflectComponentType, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ROUTES } from '@cv/shared-util-routing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { provideRouter, Route, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { FeatureToggleService } from '@cv/shared-data-access';
import { cvFeatureShellRoutes } from './lib.routes';

/** The component a route lazy loads: like the router, it takes a module's default export */
async function loadedComponent(route?: Route): Promise<Type<unknown>> {
  const loaded = await route?.loadComponent?.();
  return (
    loaded && typeof loaded === 'object' && 'default' in loaded
      ? loaded.default
      : loaded
  ) as Type<unknown>;
}

describe('cvFeatureShellRoutes', () => {
  beforeEach(() => localStorage.clear());

  it('opens the first sub item and lists all sub items', async () => {
    // Arrange
    TestBed.configureTestingModule({
      providers: [
        provideRouter(cvFeatureShellRoutes),
        provideI18nTesting(),
        // the pages load their data from the cv api
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
      ],
    });

    // Act
    const harness = await RouterTestingHarness.create('/');
    const element: HTMLElement = harness.fixture.nativeElement;

    // Assert
    expect(TestBed.inject(Router).url).toBe('/home');
    expect(
      Array.from(element.querySelectorAll('ds-sub-navbar > nav a')).map(
        // accessible names: the home tab is an icon labelled by aria-label
        (link) => link.getAttribute('aria-label') ?? link.textContent?.trim()
      )
    ).toEqual([
      'Home',
      'Personal',
      'Education',
      'Experience',
      'Skills',
      'References',
    ]);
  });

  it('leaves out the sub items switched off on the admin page', async () => {
    // Arrange
    TestBed.configureTestingModule({
      providers: [
        provideRouter(cvFeatureShellRoutes),
        provideI18nTesting(),
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
      ],
    });
    const toggles = TestBed.inject(FeatureToggleService);
    toggles.change('cv-education', false);
    toggles.change('cv-references', false);

    // Act
    const harness = await RouterTestingHarness.create('/');
    const element: HTMLElement = harness.fixture.nativeElement;

    // Assert
    expect(
      Array.from(element.querySelectorAll('ds-sub-navbar > nav a')).map(
        (link) => link.getAttribute('aria-label') ?? link.textContent?.trim()
      )
    ).toEqual(['Home', 'Personal', 'Experience', 'Skills']);
  });

  it('marks the opened page as the active sub item', async () => {
    // Arrange
    TestBed.configureTestingModule({
      providers: [
        provideRouter(cvFeatureShellRoutes),
        provideI18nTesting(),
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
      ],
    });

    // Act
    const harness = await RouterTestingHarness.create('/education');
    // routerLinkActive marks the tab after the navigation has rendered
    await harness.fixture.whenStable();
    const element: HTMLElement = harness.fixture.nativeElement;

    // Assert
    // tab links with a tab panel mark the open page as the selected tab
    const active = element.querySelector(
      'ds-sub-navbar > nav a[aria-selected="true"]'
    );
    expect(TestBed.inject(Router).url).toBe('/education');
    expect(active?.textContent?.trim()).toBe('Education');
  });

  it.each([
    [ROUTES.CV.HOME, 'cv-home'],
    [ROUTES.CV.PERSONAL, 'cv-personal-details'],
    [ROUTES.CV.EDUCATION, 'cv-education-list'],
    [ROUTES.CV.EXPERIENCE, 'cv-experience-list'],
    [ROUTES.CV.SKILLS, 'cv-skill-list'],
    [ROUTES.CV.REFERENCES, 'cv-reference-list'],
  ])('lazy loads the "%s" page as <%s>', async (path, selector) => {
    // Arrange
    const route = cvFeatureShellRoutes[0].children?.find(
      (child) => child.path === path
    );

    // Act
    const component = await loadedComponent(route);

    // Assert
    expect(reflectComponentType(component)?.selector).toBe(selector);
  });

  it('lazy loads a standalone component for every page', async () => {
    // Arrange
    const pages = cvFeatureShellRoutes[0].children?.filter(
      (route) => route.loadComponent
    );

    // Act
    const components = await Promise.all(pages?.map(loadedComponent) ?? []);

    // Assert
    expect(components.length).toBeGreaterThan(0);
    for (const component of components) {
      expect(component).toEqual(expect.any(Function));
    }
  });
});
