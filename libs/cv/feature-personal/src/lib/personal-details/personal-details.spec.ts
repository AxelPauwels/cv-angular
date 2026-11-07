import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { PersonalDetails } from './personal-details';

describe('PersonalDetails', () => {
  it('shows the person from the cv api as cards', async () => {
    // Arrange & Act
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
        provideI18nTesting(),
      ],
    });
    const fixture = TestBed.createComponent(PersonalDetails);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    // Assert
    // three sections, each with a heading and a tagline in an hgroup
    const headings = Array.from(
      element.querySelectorAll('section > ds-section-heading > hgroup')
    );
    expect(
      headings.map((h) => h.querySelector('h2')?.textContent?.trim())
    ).toEqual(['About me', 'Languages', 'Hobbies & Interests']);
    expect(headings[0].querySelector('p')?.textContent?.trim()).toBe(
      'The human behind the code'
    );
    // about me: no card, only label / value pairs
    const about = element.querySelector('.personal-details__facts');
    expect(about).not.toBeNull();
    expect(about?.closest('ds-card')).toBeNull();
    const facts = Array.from(
      element.querySelectorAll('.personal-details__facts > div')
    );
    expect(facts[0].querySelector('dt')?.textContent?.trim()).toBe('Location');
    expect(facts[0].querySelector('dd')?.textContent?.trim()).toBe(
      'Geel, Belgium'
    );
    expect(
      facts[0].querySelector('mat-icon')?.getAttribute('aria-hidden')
    ).toBe('true');
    // languages: a card per language with its levels as text, the bar decorative
    const languages = Array.from(
      element.querySelectorAll('.personal-details__languages > li')
    );
    expect(
      languages.map((l) => l.querySelector('h3 > span')?.textContent?.trim())
    ).toEqual(['Dutch', 'English', 'French']);
    // the native language has a "Native" tag on its title line
    expect(
      languages[0].querySelector('h3 .card__tag')?.textContent?.trim()
    ).toBe('Native');
    expect(languages[1].querySelector('.card__tag')).toBeNull();
    // no avatar on the language cards
    expect(languages[0].querySelector('.card__icon')).toBeNull();
    expect(
      languages[0].querySelector('.personal-details__levels')?.textContent
    ).toContain('Speaking');
    expect(
      languages[0]
        .querySelector('ds-progress-bar.personal-details__level-bar')
        ?.getAttribute('aria-hidden')
    ).toBe('true');
    // the contact links live in the footer
    expect(element.querySelector('address')).toBeNull();
    expect(element.textContent).not.toContain("Let's talk");
    // hobbies are cards in the header's colors in a list, the name as an h3, no
    // avatar; only the faint icon in the corner
    const hobbies = Array.from(
      element.querySelectorAll('.personal-details__hobbies > li')
    );
    expect(hobbies.length).toBeGreaterThan(0);
    for (const hobby of hobbies) {
      expect(hobby.querySelector('mat-card.card--brand')).not.toBeNull();
      expect(hobby.querySelector('h3')?.textContent?.trim()).toBeTruthy();
      expect(hobby.querySelector('.card__icon')).toBeNull();
      expect(
        hobby.querySelector('.personal-details__hobby-mark.cv-icon')
      ).not.toBeNull();
    }
    // a hobby with a comment shows it as the subtitle and gets a wide tile
    const wide = element.querySelector('.personal-details__hobby--wide');
    expect(
      wide?.querySelector('.card__subtitle')?.textContent?.trim()
    ).toBeTruthy();
    expect(
      facts
        .find((fact) =>
          fact.querySelector('dt')?.textContent?.includes('Children')
        )
        ?.querySelector('dd')?.textContent
    ).toBe('Jade');
    // API values are translation keys, rendered in English
    expect(element.querySelector('dl')?.textContent).toContain('Married');
    expect(element.textContent).not.toContain('t.');
  });
});
