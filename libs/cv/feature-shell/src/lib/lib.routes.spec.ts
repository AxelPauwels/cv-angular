import { reflectComponentType, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ROUTES } from '@cv/shared-util-routing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { FeatureToggleService } from '@cv/shared-data-access';
import { cvFeatureShellRoutes } from './lib.routes';

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
    expect(TestBed.inject(Router).url).toBe('/personal');
    expect(
      Array.from(element.querySelectorAll('ds-sub-navbar > nav a')).map(
        (link) => link.textContent?.trim()
      )
    ).toEqual(['Personal', 'Education', 'Experience', 'Skills', 'References']);
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
        (link) => link.textContent?.trim()
      )
    ).toEqual(['Personal', 'Experience', 'Skills']);
  });

  it('opens the first sub item that is not switched off', async () => {
    // Arrange
    TestBed.configureTestingModule({
      providers: [
        provideRouter(cvFeatureShellRoutes),
        provideI18nTesting(),
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
      ],
    });
    TestBed.inject(FeatureToggleService).change('cv-personal', false);

    // Act
    await RouterTestingHarness.create('/');

    // Assert
    expect(TestBed.inject(Router).url).toBe('/education');
  });

  it('sends unknown cv urls to the first sub item', async () => {
    // Arrange
    TestBed.configureTestingModule({
      providers: [
        provideRouter(cvFeatureShellRoutes),
        provideI18nTesting(),
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
      ],
    });

    // Act
    await RouterTestingHarness.create('/does-not-exist');

    // Assert
    expect(TestBed.inject(Router).url).toBe('/personal');
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
    const component = (await route?.loadComponent?.()) as Type<unknown>;

    // Assert
    expect(reflectComponentType(component)?.selector).toBe(selector);
  });

  it('lazy loads a standalone component for every page', async () => {
    // Arrange
    const pages = cvFeatureShellRoutes[0].children?.filter(
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
