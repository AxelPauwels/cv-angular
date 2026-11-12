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
  { labelKey: 't.nav.home', path: ROUTES.HOME.ROOT, icon: 'home' },
  { labelKey: 't.nav.cv', path: ROUTES.CV.ROOT },
  { labelKey: 't.nav.technical', path: ROUTES.TECHNICAL.ROOT },
  { labelKey: 't.nav.showcase', path: ROUTES.SHOWCASE.ROOT },
];

// the pages come from three lazy loaded feature shells, which can take a while on a cold run
const MENU_LOADED = { timeout: 5000 };

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
    }, MENU_LOADED);

    // Assert
    expect(element.querySelector('[role="status"]')).toBeNull();
    expect(groups(element)).toEqual(['Home', 'CV', 'Technical', 'Showcase']);
    expect(links(element)).toContain('/cv/personal');
    expect(links(element)).toContain('/technical/versions');
    expect(links(element)).toContain('/showcase/lighthouse');
  });

  it('leaves out the pages switched off on the admin page', async () => {
    // Arrange
    const { fixture, element } = await render();
    await vi.waitFor(async () => {
      await fixture.whenStable();
      expect(element.querySelector('ds-nav-accordion')).toBeTruthy();
    }, MENU_LOADED);

    // Act
    TestBed.inject(FeatureToggleService).change('technical-versions', false);
    await fixture.whenStable();

    // Assert
    expect(links(element)).not.toContain('/technical/versions');
    expect(links(element)).toContain('/technical/architecture');
  });

  it('shows home, without pages of its own, as a link instead of a group', async () => {
    // Arrange
    const { fixture, element } = await render();

    // Act
    await vi.waitFor(async () => {
      await fixture.whenStable();
      expect(element.querySelector('ds-nav-accordion')).toBeTruthy();
    }, MENU_LOADED);

    // Assert
    const home = element.querySelector<HTMLAnchorElement>(
      'a.nav-accordion__toggle'
    );
    expect(home?.getAttribute('href')).toBe('/home');
    expect(home?.textContent).toContain('Home');
    expect(
      element.querySelectorAll('button.nav-accordion__toggle')
    ).toHaveLength(3);
  });
});
