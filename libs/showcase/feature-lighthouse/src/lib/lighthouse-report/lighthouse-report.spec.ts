import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import report from '../internal/lighthouse-scores.json';
import { LIGHTHOUSE_SECTIONS, scoreRating } from '../internal/lighthouse-pages';
import { LighthouseReport } from './lighthouse-report';

async function render(): Promise<HTMLElement> {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), provideI18nTesting()],
  });
  const fixture = TestBed.createComponent(LighthouseReport);
  await fixture.whenStable();
  return fixture.nativeElement;
}

describe('LighthouseReport', () => {
  it('shows each main menu item with a row per sub menu item', async () => {
    // Arrange
    const element = await render();

    // Act
    const sections = Array.from(element.querySelectorAll('h2')).map((h) =>
      h.textContent?.trim()
    );
    const cvPages = Array.from(
      element.querySelectorAll('table')[0].querySelectorAll('tbody th a')
    ).map((link) => [link.textContent?.trim(), link.getAttribute('href')]);

    // Assert
    expect(sections).toEqual(['CV', 'Technical', 'Showcase']);
    expect(cvPages[0]).toEqual(['Home', '/home']);
    expect(cvPages).toHaveLength(6);
  });

  it('gives every row the four Lighthouse scores, in Lighthouse order', async () => {
    // Arrange
    const element = await render();
    const table = element.querySelectorAll('table')[0];

    // Act
    const headers = Array.from(table.querySelectorAll('thead th')).map((th) =>
      th.textContent?.trim()
    );
    const home = Array.from(
      table.querySelectorAll('tbody tr')[0].querySelectorAll('td')
    ).map((td) => td.textContent?.trim());

    // Assert
    expect(headers).toEqual([
      'Page',
      'Performance',
      'Accessibility',
      'Best Practices',
      'SEO',
    ]);
    const scores = report.pages['/home'];
    expect(home).toEqual([
      `${scores.performance}`,
      `${scores.accessibility}`,
      `${scores['best-practices']}`,
      `${scores.seo}`,
    ]);
  });

  it('labels each table with its main menu item', async () => {
    // Arrange
    const element = await render();

    // Act
    const tables = Array.from(element.querySelectorAll('table'));

    // Assert
    for (const table of tables) {
      const heading = element.querySelector(
        `#${table.getAttribute('aria-labelledby')}`
      );
      expect(heading?.tagName).toBe('H2');
    }
  });

  it('only keeps scores of pages that are in the tree', () => {
    // Arrange
    const links = LIGHTHOUSE_SECTIONS.flatMap(({ pages }) =>
      pages.map(({ link }) => link)
    );

    // Act
    const unknown = Object.keys(report.pages).filter(
      (link) => !links.includes(link)
    );

    // Assert
    expect(unknown).toEqual([]);
  });
});

describe('scoreRating', () => {
  it.each([
    [0, 'fail'],
    [49, 'fail'],
    [50, 'average'],
    [89, 'average'],
    [90, 'pass'],
    [100, 'pass'],
  ] as const)('rates %i as %s, like Lighthouse', (score, rating) => {
    // Act
    const actual = scoreRating(score);

    // Assert
    expect(actual).toBe(rating);
  });
});
