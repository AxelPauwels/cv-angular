import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { provideRouter, Router } from '@angular/router';
import {
  AccessibilityService,
  FeatureToggleService,
  FontService,
  saveFeatureTogglesForTesting,
  ThemeService,
} from '@cv/shared-data-access';
import { LanguageService } from '@cv/shared-data-access-i18n';
import { By } from '@angular/platform-browser';
import { Shell } from './shell';

@Component({ template: '' })
class Page {}

describe('Shell', () => {
  beforeEach(() => {
    localStorage.clear();
    // every menu item and navbar icon on, whatever the defaults
    saveFeatureTogglesForTesting();
  });

  const mainMenu = (element: HTMLElement) =>
    Array.from(element.querySelectorAll('header nav a')).map((link) =>
      link.textContent?.trim()
    );

  it('hides the main menu items and navbar icons switched off on the admin page', async () => {
    // Arrange
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideI18nTesting()],
    });
    const fixture = TestBed.createComponent(Shell);
    const element: HTMLElement = fixture.nativeElement;
    const toggles = TestBed.inject(FeatureToggleService);

    // Act
    toggles.change('main-menu-showcase', false);
    toggles.change('navbar-download-cv', false);
    toggles.change('navbar-language-switcher', false);
    await fixture.whenStable();

    // Assert
    expect(mainMenu(element)).toEqual(['CV', 'TECHNICAL']);
    expect(element.querySelector('ds-download-menu')).toBeNull();
    expect(element.querySelector('ds-language-switcher')).toBeNull();
    expect(element.querySelector('ds-theme-switcher')).toBeTruthy();
  });

  it('hides a main menu item once its last sub menu item is switched off', async () => {
    // Arrange
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideI18nTesting()],
    });
    const fixture = TestBed.createComponent(Shell);
    const element: HTMLElement = fixture.nativeElement;
    const toggles = TestBed.inject(FeatureToggleService);
    const technicalPages = [
      'technical-architecture',
      'technical-project-graph',
      'technical-graphql-docs',
      'technical-code-coverage',
      'technical-end-to-end-tests',
      'technical-versions',
    ] as const;

    // Act
    technicalPages.forEach((id) => toggles.change(id, false));
    await fixture.whenStable();

    // Assert
    expect(mainMenu(element)).toEqual(['CV', 'SHOWCASE']);
  });

  function configureWithPages() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'home', component: Page },
          { path: 'experience', component: Page },
        ]),
        provideI18nTesting(),
      ],
    });
  }

  it('has no footer on the home page', async () => {
    // Arrange
    configureWithPages();
    const fixture = TestBed.createComponent(Shell);
    const element: HTMLElement = fixture.nativeElement;

    // Act
    await TestBed.inject(Router).navigateByUrl('/home');
    await fixture.whenStable();

    // Assert
    expect(element.querySelector('footer')).toBeNull();
  });

  it('has a footer on every other page', async () => {
    // Arrange
    configureWithPages();
    const fixture = TestBed.createComponent(Shell);
    const element: HTMLElement = fixture.nativeElement;

    // Act
    await TestBed.inject(Router).navigateByUrl('/experience');
    await fixture.whenStable();

    // Assert
    expect(element.querySelector('footer')).toBeTruthy();
  });

  it('links the name in the footer to the admin page, also with its menu item off', async () => {
    // Arrange
    saveFeatureTogglesForTesting({ 'showcase-feature-toggles': false });
    configureWithPages();
    const fixture = TestBed.createComponent(Shell);
    const element: HTMLElement = fixture.nativeElement;

    // Act
    await TestBed.inject(Router).navigateByUrl('/experience');
    await fixture.whenStable();

    // Assert
    const link = element.querySelector<HTMLAnchorElement>('footer p a');
    expect(link?.getAttribute('href')).toBe('/showcase/feature-toggles');
    expect(link?.textContent).toContain('Axel Pauwels');
    expect(getComputedStyle(link as Element).textDecorationLine).toBe(
      'underline'
    );
  });

  it('lays out header, main and footer with the domain navigation', async () => {
    // Arrange
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideI18nTesting()],
    });

    // Act
    const fixture = TestBed.createComponent(Shell);
    await fixture.whenStable();

    // Assert
    const element: HTMLElement = fixture.nativeElement;
    for (const landmark of ['header', 'main', 'footer']) {
      expect(element.querySelector(landmark)).toBeTruthy();
    }
    expect(mainMenu(element)).toEqual(['CV', 'TECHNICAL', 'SHOWCASE']);
    expect(element.querySelector('main router-outlet')).toBeTruthy();
  });

  it('offers the english and dutch cv as pdf downloads in the header', async () => {
    // Arrange
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideI18nTesting()],
    });
    const fixture = TestBed.createComponent(Shell);
    await fixture.whenStable();
    const button = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLButtonElement>('header ds-download-menu button');

    // Act
    button?.click();
    await fixture.whenStable();

    // Assert
    // The menu renders in an overlay outside the component, hence `document`
    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('a.download-menu__option')
    );
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/assets/documents/Axel-Pauwels_CV_Senior-Angular-Developer_EN.pdf',
      '/assets/documents/Axel-Pauwels_CV_Senior-Angular-Developer_NL.pdf',
    ]);
    expect(links.map((link) => link.getAttribute('download'))).toEqual([
      'Axel-Pauwels_CV_Senior-Angular-Developer_EN.pdf',
      'Axel-Pauwels_CV_Senior-Angular-Developer_NL.pdf',
    ]);
  });

  describe('navbar preferences', () => {
    async function render() {
      TestBed.configureTestingModule({
        providers: [provideRouter([]), provideI18nTesting()],
      });
      const fixture = TestBed.createComponent(Shell);
      await fixture.whenStable();
      const emit = (selector: string, output: string, value?: unknown) =>
        fixture.debugElement
          .query(By.css(selector))
          .triggerEventHandler(output, value);
      return { fixture, emit };
    }

    it('changes and resets the theme, ignoring unknown themes', async () => {
      // Arrange
      const { emit } = await render();
      const themes = TestBed.inject(ThemeService);
      const initial = themes.theme();
      const other = themes.themes.find(({ id }) => id !== initial)?.id;

      // Act
      emit('ds-theme-switcher', 'themeChange', other);
      const changed = themes.theme();
      emit('ds-theme-switcher', 'themeChange', 'no-such-theme');
      const afterUnknown = themes.theme();
      emit('ds-theme-switcher', 'themeReset');

      // Assert
      expect(changed).toBe(other);
      expect(afterUnknown).toBe(other);
      expect(themes.theme()).toBe(initial);
    });

    it('changes and resets the font, ignoring unknown fonts', async () => {
      // Arrange
      const { emit } = await render();
      const fonts = TestBed.inject(FontService);
      const initial = fonts.font();
      const other = fonts.fonts.find(({ id }) => id !== initial)?.id;

      // Act
      emit('ds-font-switcher', 'fontChange', other);
      const changed = fonts.font();
      emit('ds-font-switcher', 'fontChange', 'no-such-font');
      const afterUnknown = fonts.font();
      emit('ds-font-switcher', 'fontReset');

      // Assert
      expect(changed).toBe(other);
      expect(afterUnknown).toBe(other);
      expect(fonts.font()).toBe(initial);
    });

    it('changes and resets the color scheme', async () => {
      // Arrange
      const { emit } = await render();
      const themes = TestBed.inject(ThemeService);
      const initial = themes.colorScheme();
      const other = initial === 'dark' ? 'light' : 'dark';

      // Act
      emit('ds-color-scheme-switcher', 'colorSchemeChange', other);
      const changed = themes.colorScheme();
      emit('ds-color-scheme-switcher', 'colorSchemeReset');

      // Assert
      expect(changed).toBe(other);
      expect(themes.colorScheme()).toBe(initial);
    });

    it('changes the accessibility settings, dropping an unknown text size', async () => {
      // Arrange
      const { emit } = await render();
      const accessibility = TestBed.inject(AccessibilityService);

      // Act
      emit('ds-accessibility-switcher', 'settingsChange', {
        textSize: 125,
        wideTextSpacing: true,
      });
      const changed = accessibility.settings();
      emit('ds-accessibility-switcher', 'settingsChange', {
        textSize: 999,
        wideTextSpacing: false,
      });
      const afterUnknown = accessibility.settings();
      emit('ds-accessibility-switcher', 'resetSettings');

      // Assert
      expect(changed.textSize).toBe(125);
      expect(changed.wideTextSpacing).toBe(true);
      expect(afterUnknown.textSize).toBe(125);
      expect(afterUnknown.wideTextSpacing).toBe(false);
      expect(accessibility.isDefault()).toBe(true);
    });

    it('changes and resets the language, ignoring unknown languages', async () => {
      // Arrange
      const { emit } = await render();
      const languages = TestBed.inject(LanguageService);

      // Act
      emit('ds-language-switcher', 'languageChange', 'xx');
      emit('ds-language-switcher', 'languageChange', 'nl');
      await vi.waitFor(() => expect(languages.language()).toBe('nl'));
      emit('ds-language-switcher', 'languageReset');

      // Assert
      await vi.waitFor(() => expect(languages.language()).toBe('en'));
    });
  });
});
