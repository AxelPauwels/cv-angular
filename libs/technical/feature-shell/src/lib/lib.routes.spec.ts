import { TestBed } from '@angular/core/testing';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import {
  provideRouter,
  Router,
  withComponentInputBinding,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { FeatureToggleService } from '@cv/shared-data-access';
import { technicalFeatureShellRoutes } from './lib.routes';

// every technical page, so the tests don't depend on the toggle defaults
const TECHNICAL_PAGES = [
  'technical-architecture',
  'technical-project-graph',
  'technical-graphql-docs',
  'technical-code-coverage',
  'technical-end-to-end-tests',
  'technical-versions',
] as const;

function switchOnAllPages(toggles: FeatureToggleService): void {
  for (const page of TECHNICAL_PAGES) toggles.change(page, true);
}

describe('technicalFeatureShellRoutes', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('opens the first sub item and lists all sub items', async () => {
    // Arrange: all pages on, whatever the defaults
    TestBed.configureTestingModule({
      providers: [
        provideRouter(technicalFeatureShellRoutes, withComponentInputBinding()),
        provideI18nTesting(),
      ],
    });
    switchOnAllPages(TestBed.inject(FeatureToggleService));

    // Act
    const harness = await RouterTestingHarness.create('/');
    const element: HTMLElement = harness.fixture.nativeElement;

    // Assert
    expect(TestBed.inject(Router).url).toBe('/architecture');
    expect(
      Array.from(element.querySelectorAll('ds-sub-navbar > nav a')).map(
        (link) => link.textContent?.trim()
      )
    ).toEqual([
      'Architecture',
      'Project graph',
      'graphql docs',
      'code coverage',
      'End-to-end tests',
      'Versions',
    ]);
  });

  it('leaves out the pages switched off and opens the first one left', async () => {
    // Arrange
    TestBed.configureTestingModule({
      providers: [
        provideRouter(technicalFeatureShellRoutes, withComponentInputBinding()),
        provideI18nTesting(),
      ],
    });
    const toggles = TestBed.inject(FeatureToggleService);
    switchOnAllPages(toggles);
    toggles.change('technical-architecture', false);
    toggles.change('technical-graphql-docs', false);

    // Act
    const harness = await RouterTestingHarness.create('/');
    const element: HTMLElement = harness.fixture.nativeElement;

    // Assert
    expect(TestBed.inject(Router).url).toBe('/project-graph');
    expect(
      Array.from(element.querySelectorAll('ds-sub-navbar > nav a')).map(
        (link) => link.textContent?.trim()
      )
    ).toEqual([
      'Project graph',
      'code coverage',
      'End-to-end tests',
      'Versions',
    ]);
  });
});
