import { TestBed } from '@angular/core/testing';
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
    // Arrange & Act
    TestBed.configureTestingModule({
      providers: [
        provideRouter(cvFeatureShellRoutes),
        provideI18nTesting(),
        // the pages load their data from the cv api
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
      ],
    });
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
});
