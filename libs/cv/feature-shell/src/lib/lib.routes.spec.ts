import { TestBed } from '@angular/core/testing';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { cvFeatureShellRoutes } from './lib.routes';

describe('cvFeatureShellRoutes', () => {
  it('opens the first sub item and lists all sub items', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(cvFeatureShellRoutes), provideI18nTesting()],
    });
    const harness = await RouterTestingHarness.create('/');
    const element: HTMLElement = harness.fixture.nativeElement;

    expect(TestBed.inject(Router).url).toBe('/personal');
    expect(
      Array.from(element.querySelectorAll('ds-sub-navbar a')).map((link) =>
        link.textContent?.trim()
      )
    ).toEqual(['Personal', 'Education', 'Experience', 'Skills', 'References']);
  });
});
