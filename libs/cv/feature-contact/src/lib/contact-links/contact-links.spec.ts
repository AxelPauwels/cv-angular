import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  FeatureToggleService,
  inBrowserGraphqlInterceptor,
} from '@cv/shared-data-access';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { provideRouter } from '@angular/router';
import { ContactLinks } from './contact-links';

describe('ContactLinks', () => {
  it('links to the AI assistant, the contact page, LinkedIn and GitHub from the cv api, in a named list', async () => {
    // Arrange
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
        provideI18nTesting(),
        provideRouter([]),
      ],
    });

    // Act
    const fixture = TestBed.createComponent(ContactLinks);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    // Assert
    expect(element.querySelector('ul')?.getAttribute('aria-label')).toBe(
      "Let's talk"
    );
    const links = Array.from(element.querySelectorAll('a'));
    // icon-only links: the accessible name comes from aria-label
    expect(links.map((link) => link.getAttribute('aria-label'))).toEqual([
      'Ask my AI assistant',
      'Contact',
      'LinkedIn',
      'GitHub',
    ]);
    expect(links[0].getAttribute('href')).toBe('/showcase/ai-assistant');
    expect(links[1].getAttribute('href')).toBe('/contact');
    expect(links[3].getAttribute('href')).toBe(
      'https://github.com/AxelPauwels/cv-angular/'
    );
    expect(
      element.querySelector('ds-lordicon')?.getAttribute('aria-hidden')
    ).toBe('true');
  });

  it('hides the AI assistant link while its showcase item is switched off', async () => {
    // Arrange
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
        provideI18nTesting(),
        provideRouter([]),
      ],
    });
    TestBed.inject(FeatureToggleService).change('showcase-ai-assistant', false);

    // Act
    const fixture = TestBed.createComponent(ContactLinks);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    // Assert
    const labels = Array.from(element.querySelectorAll('a')).map((link) =>
      link.getAttribute('aria-label')
    );
    expect(labels).toEqual(['Contact', 'LinkedIn', 'GitHub']);
  });
});
