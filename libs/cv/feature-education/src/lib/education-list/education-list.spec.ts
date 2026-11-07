import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { EducationList } from './education-list';

describe('EducationList', () => {
  it('shows the educations as a year timeline, then certificates and trainings', async () => {
    // Arrange & Act
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
        provideI18nTesting(),
      ],
    });
    const fixture = TestBed.createComponent(EducationList);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    // Assert
    const years = Array.from(element.querySelectorAll('.timeline__year')).map(
      (icon) => Number(icon.textContent?.trim())
    );
    expect(years.length).toBeGreaterThan(1);
    expect(years).toEqual([...years].sort((a, b) => b - a));
    // the end year is on the line: the bachelor ran 2015 – 2018
    expect(years[0]).toBe(2018);

    const cards = element.querySelectorAll('ds-card');
    expect(cards.length).toBe(2);
    // each card sits in a section named by its own heading, with a tagline
    const sections = element.querySelectorAll('section[aria-labelledby]');
    expect(sections.length).toBe(2);
    for (const section of Array.from(sections)) {
      const id = section.getAttribute('aria-labelledby') ?? '';
      expect(
        section.querySelector(`h2#${id}`)?.textContent?.trim()
      ).toBeTruthy();
      expect(
        section.querySelector('ds-section-heading hgroup > p')
      ).not.toBeNull();
    }
    for (const card of Array.from(cards)) {
      expect(card.querySelectorAll('li').length).toBeGreaterThan(0);
    }
    // specializations are translation keys, rendered in English
    expect(element.textContent).not.toContain('t.');
    // certificates link to their file, opened in a new tab
    const certificateLinks = Array.from(
      cards[0].querySelectorAll<HTMLAnchorElement>('a')
    );
    expect(certificateLinks.length).toBe(5);
    for (const link of certificateLinks) {
      expect(link.getAttribute('href')).toMatch(/^\/assets\/certificates\//);
      expect(link.target).toBe('_blank');
      expect(link.rel).toContain('noopener');
    }
    // every certificate shows its issuer and year
    expect(cards[0].textContent).toContain(
      'Linux Professional Institute · 2016'
    );
    // trainings show their provider, with the year (or a status instead of a
    // missing year) in its own column on the right
    const trainings = Array.from(
      cards[1].querySelectorAll('.education-list__item')
    ).map((item) => ({
      provider: item
        .querySelector('.education-list__meta')
        ?.textContent?.trim(),
      year: item.querySelector('.education-list__year')?.textContent?.trim(),
    }));
    expect(trainings).toContainEqual({
      provider: 'Sopra Steria',
      year: '2024',
    });
    expect(trainings).toContainEqual({ provider: undefined, year: 'yearly' });
  });
});
