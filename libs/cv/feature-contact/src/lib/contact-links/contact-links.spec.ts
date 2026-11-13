import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { ContactLinks } from './contact-links';

describe('ContactLinks', () => {
  it('links to email, LinkedIn and GitHub from the cv api, in a named list', async () => {
    // Arrange
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
        provideI18nTesting(),
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
      'Email',
      'LinkedIn',
      'GitHub',
    ]);
    expect(links[0].getAttribute('href')).toMatch(/^mailto:/);
    expect(links[2].getAttribute('href')).toBe(
      'https://github.com/AxelPauwels/cv-angular/'
    );
    expect(
      element.querySelector('ds-lordicon')?.getAttribute('aria-hidden')
    ).toBe('true');
  });
});
