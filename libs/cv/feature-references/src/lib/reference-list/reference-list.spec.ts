import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import type { Reference } from '@cv/cv-data-access-references';
import { groupByWork, initials, ReferenceList } from './reference-list';

describe('ReferenceList', () => {
  function create() {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
        provideI18nTesting(),
      ],
    });
    return TestBed.createComponent(ReferenceList);
  }

  async function render(fixture = create()) {
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    const steps = Array.from(
      element.querySelectorAll<HTMLElement>('.timeline__step')
    );
    const headers = Array.from(
      element.querySelectorAll<HTMLElement>('.timeline__header')
    );
    return { fixture, element, steps, headers };
  }

  const columnsOf = (step: HTMLElement) =>
    Array.from(
      step.querySelectorAll<HTMLElement>(
        '.reference-list__columns > .reference-list__column'
      )
    );
  const namesIn = (column: HTMLElement) =>
    Array.from(column.querySelectorAll('ds-card h3')).map((h) =>
      h.textContent?.trim()
    );

  it('shows one step per IT employer, newest first, with end years as steps', async () => {
    // Arrange
    const fixture = create();

    // Act
    const { element, headers } = await render(fixture);

    // Assert
    expect(
      headers.map((h) =>
        h.querySelector('.timeline-item__title')?.textContent?.trim()
      )
    ).toEqual(['Sopra Steria', 'Innomedio', 'PHPro']);
    // the end year, or "present" while a reference is current
    const years = headers.map((h) => {
      const badge = h.querySelector('.timeline__year')?.textContent?.trim();
      return badge === 'present' ? Number.POSITIVE_INFINITY : Number(badge);
    });
    expect(years).toEqual([...years].sort((a, b) => b - a));
    // hospitality is left out
    expect(element.textContent).not.toContain('Den Cardijn');
    expect(element.textContent).not.toContain('t.');
  });

  it('opens the newest employer', async () => {
    // Arrange
    const fixture = create();

    // Act
    const { headers } = await render(fixture);

    // Assert
    expect(headers.map((h) => h.getAttribute('aria-expanded'))).toEqual([
      'true',
      'false',
      'false',
    ]);
  });

  it('expands another employer on click', async () => {
    // Arrange
    const { fixture, headers } = await render();

    // Act
    headers[1].click();
    await fixture.whenStable();

    // Assert
    expect(headers[0].getAttribute('aria-expanded')).toBe('false');
    expect(headers[1].getAttribute('aria-expanded')).toBe('true');
  });

  it("puts the employer's references in the first column and its clients' in the second", async () => {
    // Arrange
    const { steps } = await render();

    // Act
    const [sopraSteria, innomedio] = steps.map(columnsOf);

    // Assert
    expect(sopraSteria.length).toBe(2);
    expect(namesIn(sopraSteria[0])).toEqual([
      'Kevin Jannis',
      'Marijke Boye',
      'Bart Headens',
    ]);
    expect(namesIn(sopraSteria[1])).toEqual([
      'Roel Frison',
      'Lowie Cuypers',
      'Bettina Verheyen',
    ]);
    // both columns are labelled lists, so the client is told apart
    const lists = sopraSteria.flatMap((column) =>
      Array.from(column.querySelectorAll('ul'))
    );
    expect(
      lists.map((list) =>
        document
          .getElementById(list.getAttribute('aria-labelledby') ?? '')
          ?.textContent?.trim()
      )
    ).toEqual([
      expect.stringContaining('Sopra Steria'),
      expect.stringContaining('Ravago'),
    ]);

    // without clients: one unlabelled column
    expect(innomedio.length).toBe(1);
    expect(
      innomedio[0].querySelector('ul')?.hasAttribute('aria-labelledby')
    ).toBe(false);
  });

  it('shows each reference as a card with name, initials and function', async () => {
    // Arrange
    const { element } = await render();

    // Act
    const cards = Array.from(element.querySelectorAll('ds-card'));

    // Assert
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      // the name as an h3 under the step's h2
      const name = card.querySelector('h3')?.textContent?.trim() ?? '';
      expect(name).toBeTruthy();
      expect(card.querySelector('.card__subtitle')).toBeNull();
      expect(
        card.querySelector('.reference-list__function')?.textContent?.trim()
      ).toBeTruthy();
      expect(
        card.querySelector('.card__icon--initials')?.textContent?.trim()
      ).toBe(initials(name));
      // the period is the step's, not repeated per card
      expect(card.textContent).not.toMatch(/\d{4} – /);
    }
    // no phone numbers
    expect(element.querySelector('a[href^="tel:"]')).toBeNull();
    // only the cards (and column labels) in a step: no period or icon before them
    expect(element.querySelector('.timeline-item__detail')).toBeNull();
  });
});

describe('groupByWork', () => {
  const reference = (
    name: string,
    work: string,
    start: string,
    end?: string,
    client?: string
  ): Reference => ({
    name,
    work,
    client,
    function: 'Developer',
    workCategory: 'IT',
    workCategoryPeriod: {
      start: new Date(start),
      end: end ? new Date(end) : undefined,
    },
  });

  it('groups per employer, newest first, with the clients apart', () => {
    // Arrange
    const references = [
      reference('A', 'Old', '2018', '2020'),
      reference('B', 'New', '2022', '2026', 'Client'),
      reference('C', 'New', '2021'),
      reference('D', 'Old', '2019', '2021'),
    ];

    // Act
    const groups = groupByWork(references);

    // Assert
    expect(groups.map((g) => g.work)).toEqual(['New', 'Old']);
    const [newGroup, oldGroup] = groups;
    expect(newGroup.start).toEqual(new Date('2021'));
    expect(newGroup.end).toBeNull(); // C is still current
    expect(newGroup.employer.references.map((r) => r.name)).toEqual(['C']);
    expect(newGroup.clients).toEqual([
      { name: 'Client', references: [references[1]] },
    ]);
    expect(oldGroup.start).toEqual(new Date('2018'));
    expect(oldGroup.end).toEqual(new Date('2021'));
    expect(oldGroup.clients).toEqual([]);
  });
});

describe('initials', () => {
  it.each([
    ['Roel Frison', 'RF'],
    ['  roel   frison ', 'RF'],
    ['Jan van den Berg', 'JB'],
    ['Madonna', 'M'],
    ['Émile Zola', 'ÉZ'],
    ['', ''],
  ])('%j -> %j', (name, expected) => {
    // Act & Assert
    expect(initials(name)).toBe(expected);
  });
});
