import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { provideRouter, Router } from '@angular/router';
import { FeatureToggleService } from '@cv/shared-data-access';
import { Shell } from './shell';

@Component({ template: '' })
class Page {}

describe('Shell', () => {
  beforeEach(() => localStorage.clear());

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
    expect(
      Array.from(element.querySelectorAll('header nav a')).map((link) =>
        link.textContent?.trim()
      )
    ).toEqual(['CV', 'TECHNICAL']);
    expect(element.querySelector('ds-download-menu')).toBeNull();
    expect(element.querySelector('ds-language-switcher')).toBeNull();
    expect(element.querySelector('ds-theme-switcher')).toBeTruthy();

    // Act: switching off the last technical page hides technical too
    for (const id of [
      'technical-architecture',
      'technical-project-graph',
      'technical-graphql-docs',
      'technical-code-coverage',
      'technical-end-to-end-tests',
      'technical-versions',
    ] as const) {
      toggles.change(id, false);
    }
    await fixture.whenStable();

    // Assert
    expect(
      Array.from(element.querySelectorAll('header nav a')).map((link) =>
        link.textContent?.trim()
      )
    ).toEqual(['CV']);
  });

  it('has no footer on the home page, and one on every other page', async () => {
    // Arrange
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'home', component: Page },
          { path: 'experience', component: Page },
        ]),
        provideI18nTesting(),
      ],
    });
    const fixture = TestBed.createComponent(Shell);
    const router = TestBed.inject(Router);
    const element: HTMLElement = fixture.nativeElement;

    // Act
    await router.navigateByUrl('/home');
    await fixture.whenStable();

    // Assert
    expect(element.querySelector('footer')).toBeNull();

    // Act
    await router.navigateByUrl('/experience');
    await fixture.whenStable();

    // Assert
    expect(element.querySelector('footer')).toBeTruthy();
  });

  it('links the name in the footer to the admin page, also with its menu item off', async () => {
    // Arrange
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'experience', component: Page }]),
        provideI18nTesting(),
      ],
    });
    const fixture = TestBed.createComponent(Shell);
    const element: HTMLElement = fixture.nativeElement;
    TestBed.inject(FeatureToggleService).change('showcase-admin', false);

    // Act
    await TestBed.inject(Router).navigateByUrl('/experience');
    await fixture.whenStable();

    // Assert
    const link = element.querySelector<HTMLAnchorElement>('footer p a');
    expect(link?.getAttribute('href')).toBe('/showcase/admin');
    expect(link?.textContent).toContain('Axel Pauwels');
    expect(getComputedStyle(link as Element).textDecorationLine).toBe(
      'underline'
    );
  });

  it('lays out header, main and footer with the domain navigation', async () => {
    // Arrange & Act
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideI18nTesting()],
    });
    const fixture = TestBed.createComponent(Shell);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    // Assert
    for (const landmark of ['header', 'main', 'footer']) {
      expect(element.querySelector(landmark)).toBeTruthy();
    }
    expect(
      Array.from(element.querySelectorAll('header nav a')).map((link) =>
        link.textContent?.trim()
      )
    ).toEqual(['CV', 'TECHNICAL', 'SHOWCASE']);
    expect(element.querySelector('main router-outlet')).toBeTruthy();
  });

  it('offers the english and dutch cv as pdf downloads in the header', async () => {
    // Arrange & Act
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideI18nTesting()],
    });
    const fixture = TestBed.createComponent(Shell);
    await fixture.whenStable();
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('header ds-download-menu button')
      ?.click();
    await fixture.whenStable();

    // Assert
    // The menu renders in an overlay outside the component, hence `document`
    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('a.download-menu__option')
    );
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/assets/documents/Axel%20Pauwels_CV_Senior-Angular-Developer_EN.pdf',
      '/assets/documents/Axel%20Pauwels_CV_Senior-Angular-Developer_NL.pdf',
    ]);
    expect(links.map((link) => link.getAttribute('download'))).toEqual([
      'Axel Pauwels_CV_Senior-Angular-Developer_EN.pdf',
      'Axel Pauwels_CV_Senior-Angular-Developer_NL.pdf',
    ]);
  });
});
