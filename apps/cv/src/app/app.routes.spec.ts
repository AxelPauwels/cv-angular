import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import {
  inBrowserGraphqlInterceptor,
  saveFeatureTogglesForTesting,
} from '@cv/shared-data-access';
import { appRoutes } from './app.routes';
import { App } from './app';

describe('appRoutes', () => {
  beforeEach(() => {
    localStorage.clear();
    // every menu item on, whatever the defaults
    saveFeatureTogglesForTesting();
    TestBed.configureTestingModule({
      providers: [
        provideRouter(appRoutes),
        provideI18nTesting(),
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
      ],
    });
  });

  async function navigate(url: string) {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    const linkLabels = (selector: string) =>
      Array.from(element.querySelectorAll(`${selector} a`)).map(
        // icon tabs are named by their aria-label
        (link) =>
          link.getAttribute('aria-label') ?? link.textContent?.trim() ?? ''
      );
    return {
      url: TestBed.inject(Router).url,
      main: linkLabels('ds-main-navbar > mat-toolbar > nav'),
      activeMain: element
        .querySelector('ds-main-navbar > mat-toolbar .mdc-tab--active')
        ?.textContent?.trim(),
      // only the tab links: page content inside the sub navbar has links too
      sub: linkLabels('ds-sub-navbar > nav'),
    };
  }

  it('defaults to the cv home page', async () => {
    // Arrange
    const url = '/';

    // Act
    const page = await navigate(url);

    // Assert
    expect(page.url).toBe('/home');
    expect(page.main).toEqual(['CV', 'TECHNICAL', 'SHOWCASE']);
    expect(page.activeMain).toBe('CV');
    expect(page.sub).toEqual([
      'Home',
      'Personal',
      'Education',
      'Experience',
      'Skills',
      'References',
    ]);
  });

  it('shows the showcase sub items', async () => {
    // Arrange
    const url = '/showcase';

    // Act
    const page = await navigate(url);

    // Assert
    expect(page.url).toBe('/showcase/micro-frontends');
    expect(page.activeMain).toBe('SHOWCASE');
    expect(page.sub).toEqual(['Micro-frontends', 'Lighthouse', 'Admin']);
  });

  it('sends the old admin url to the admin page in the showcase', async () => {
    // Arrange
    const url = '/admin';

    // Act
    const page = await navigate(url);

    // Assert
    expect(page.url).toBe('/showcase/admin');
  });

  it('shows the technical sub items', async () => {
    // Arrange
    const url = '/technical';

    // Act
    const page = await navigate(url);

    // Assert
    expect(page.url).toBe('/technical/architecture');
    expect(page.activeMain).toBe('TECHNICAL');
    expect(page.sub).toEqual([
      'Architecture',
      'Project graph',
      'graphql docs',
      'code coverage',
      'End-to-end tests',
      'Versions',
    ]);
  });

  it('redirects unknown urls to the cv domain', async () => {
    // Arrange
    const url = '/does-not-exist';

    // Act
    const page = await navigate(url);

    // Assert
    expect(page.url).toBe('/home');
  });

  it('navigates from the cv domain to the showcase domain', async () => {
    // Arrange
    const harness = await RouterTestingHarness.create('/personal');
    const router = TestBed.inject(Router);

    // Act
    await harness.navigateByUrl('/showcase');

    // Assert
    expect(router.url).toBe('/showcase/micro-frontends');
  });

  it('navigates from the cv domain to the technical domain', async () => {
    // Arrange
    const harness = await RouterTestingHarness.create('/personal');
    const router = TestBed.inject(Router);

    // Act
    await harness.navigateByUrl('/technical');

    // Assert
    expect(router.url).toBe('/technical/architecture');
  });
});
