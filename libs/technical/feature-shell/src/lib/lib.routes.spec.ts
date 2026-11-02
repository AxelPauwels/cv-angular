import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { technicalFeatureShellRoutes } from './lib.routes';

describe('technicalFeatureShellRoutes', () => {
  it('opens the first sub item and lists all sub items', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(technicalFeatureShellRoutes)],
    });
    const harness = await RouterTestingHarness.create('/');
    const element: HTMLElement = harness.fixture.nativeElement;

    expect(TestBed.inject(Router).url).toBe('/versions');
    expect(
      Array.from(element.querySelectorAll('lib-sub-navbar a')).map((link) =>
        link.textContent?.trim()
      )
    ).toEqual(['Versions', 'Demo1']);
  });
});
