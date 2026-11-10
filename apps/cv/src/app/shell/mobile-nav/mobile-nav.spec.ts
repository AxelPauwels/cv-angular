import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import {
  FeatureToggleService,
  saveFeatureTogglesForTesting,
} from '@cv/shared-data-access';
import { NavItem } from '@cv/shared-ui-layout';
import { ROUTES } from '@cv/shared-util-routing';
import { MobileNav } from './mobile-nav';

const DOMAINS: NavItem[] = [
  { labelKey: 't.nav.cv', path: ROUTES.CV.ROOT },
  { labelKey: 't.nav.technical', path: ROUTES.TECHNICAL.ROOT },
  { labelKey: 't.nav.showcase', path: ROUTES.SHOWCASE.ROOT },
];

describe('MobileNav', () => {
  beforeEach(() => {
    localStorage.clear();
    // every page on, whatever the defaults
    saveFeatureTogglesForTesting();
  });
  afterEach(() => localStorage.clear());

  async function render(domains: NavItem[] = DOMAINS) {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideI18nTesting()],
    });
    const fixture = TestBed.createComponent(MobileNav);
    fixture.componentRef.setInput('domains', domains);
    const element: HTMLElement = fixture.nativeElement;
    return { fixture, element };
  }

  const groups = (element: HTMLElement) =>
    Array.from(element.querySelectorAll('.nav-accordion__toggle-label')).map(
      (label) => label.textContent?.trim()
    );

  const links = (element: HTMLElement) =>
    Array.from(
      element.querySelectorAll<HTMLAnchorElement>('.nav-accordion__link')
    ).map((link) => link.getAttribute('href'));

  it('announces that the menu is loading until the pages are in', async () => {
    // Arrange
    const { fixture, element } = await render();

    // Act
    fixture.detectChanges();

    // Assert
    const status = element.querySelector('[role="status"]');
    expect(status?.textContent?.trim()).toBe('Loading the menu…');
    expect(element.querySelector('ds-nav-accordion')).toBeNull();
  });

  it('lists every domain with its pages', async () => {
    // Arrange
    const { fixture, element } = await render();

    // Act
    await vi.waitFor(async () => {
      await fixture.whenStable();
      expect(element.querySelector('ds-nav-accordion')).toBeTruthy();
    });

    // Assert
    expect(element.querySelector('[role="status"]')).toBeNull();
    expect(groups(element)).toEqual(['CV', 'Technical', 'Showcase']);
    expect(links(element)).toContain('/technical/versions');
    expect(links(element)).toContain('/showcase/lighthouse');
  });

  it('leaves out the pages switched off on the admin page', async () => {
    // Arrange
    const { fixture, element } = await render();
    await vi.waitFor(async () => {
      await fixture.whenStable();
      expect(element.querySelector('ds-nav-accordion')).toBeTruthy();
    });

    // Act
    TestBed.inject(FeatureToggleService).change('technical-versions', false);
    await fixture.whenStable();

    // Assert
    expect(links(element)).not.toContain('/technical/versions');
    expect(links(element)).toContain('/technical/architecture');
  });

  it('shows a domain without pages of its own as an empty group', async () => {
    // Arrange
    const { fixture, element } = await render([
      { labelKey: 't.nav.home', path: 'elsewhere' },
    ]);

    // Act
    await vi.waitFor(async () => {
      await fixture.whenStable();
      expect(element.querySelector('ds-nav-accordion')).toBeTruthy();
    });

    // Assert
    expect(groups(element)).toEqual(['Home']);
    expect(links(element)).toEqual([]);
  });
});
