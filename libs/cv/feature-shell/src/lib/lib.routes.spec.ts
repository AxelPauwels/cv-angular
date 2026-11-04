import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { cvFeatureShellRoutes } from './lib.routes';

describe('cvFeatureShellRoutes', () => {
  it('opens the first sub item and lists all sub items', async () => {
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

    expect(TestBed.inject(Router).url).toBe('/personal');
    expect(
      Array.from(element.querySelectorAll('ds-sub-navbar > nav a')).map(
        (link) => link.textContent?.trim()
      )
    ).toEqual(['Personal', 'Education', 'Experience', 'Skills', 'References']);
  });
});
