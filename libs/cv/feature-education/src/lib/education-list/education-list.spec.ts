import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { EducationList } from './education-list';

describe('EducationList', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
        provideI18nTesting(),
      ],
    });
  });

  async function render(): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(EducationList);
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  /** The two cards: trainings first, then certificates */
  function cards(element: HTMLElement) {
    const [trainings, certificates] = Array.from(
      element.querySelectorAll('ds-card')
    );
    return { trainings, certificates };
  }

  it('shows the educations as a year timeline, newest first', async () => {
    // Arrange
    const yearsOf = (element: HTMLElement) =>
      Array.from(element.querySelectorAll('.timeline__year')).map((icon) =>
        Number(icon.textContent?.trim())
      );

    // Act
    const element = await render();

    // Assert
    const years = yearsOf(element);
    expect(years.length).toBeGreaterThan(1);
    expect(years).toEqual([...years].sort((a, b) => b - a));
    // the end year is on the line: the bachelor ran 2015 – 2018
    expect(years[0]).toBe(2018);
    // specializations are translation keys, rendered in English
    expect(element.textContent).not.toContain('t.');
  });

  it('puts each card in a section named by its own heading, with a tagline', async () => {
    // Arrange
    const selector = 'section[aria-labelledby]';

    // Act
    const element = await render();

    // Assert
    const sections = Array.from(element.querySelectorAll(selector));
    expect(element.querySelectorAll('ds-card')).toHaveLength(2);
    expect(sections).toHaveLength(2);
    for (const section of sections) {
      const id = section.getAttribute('aria-labelledby') ?? '';
      expect(
        section.querySelector(`h2#${id}`)?.textContent?.trim()
      ).toBeTruthy();
      expect(
        section.querySelector('ds-section-heading hgroup > p')
      ).not.toBeNull();
      expect(section.querySelectorAll('li').length).toBeGreaterThan(0);
    }
  });

  it('links every certificate to its file in a new tab, with issuer and year', async () => {
    // Arrange
    const selector = 'a';

    // Act
    const element = await render();

    // Assert
    const { certificates } = cards(element);
    const links = Array.from(
      certificates.querySelectorAll<HTMLAnchorElement>(selector)
    );
    expect(links).toHaveLength(5);
    for (const link of links) {
      expect(link.getAttribute('href')).toMatch(/^\/assets\/certificates\//);
      expect(link.target).toBe('_blank');
      expect(link.rel).toContain('noopener');
    }
    expect(certificates.textContent).toContain(
      'Linux Professional Institute · 2016'
    );
  });

  it('shows trainings with their provider and their year, or a status instead', async () => {
    // Arrange
    const toTraining = (item: Element) => ({
      provider: item
        .querySelector('.education-list__meta')
        ?.textContent?.trim(),
      year: item.querySelector('.education-list__year')?.textContent?.trim(),
    });

    // Act
    const element = await render();

    // Assert
    const { trainings } = cards(element);
    const items = Array.from(
      trainings.querySelectorAll('.education-list__item')
    ).map(toTraining);
    expect(items).toContainEqual({ provider: 'Sopra Steria', year: '2024' });
    expect(items).toContainEqual({ provider: undefined, year: 'yearly' });
  });
});
