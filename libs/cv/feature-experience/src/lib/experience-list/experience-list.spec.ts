import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { ExperienceList } from './experience-list';

describe('ExperienceList', () => {
  async function render() {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
        provideI18nTesting(),
      ],
    });
    const fixture = TestBed.createComponent(ExperienceList);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    const timelines = Array.from(
      element.querySelectorAll<HTMLElement>('.timeline')
    );
    const headersOf = (timeline: HTMLElement) =>
      Array.from(timeline.querySelectorAll<HTMLElement>('.timeline__header'));
    return { fixture, element, timelines, headersOf };
  }

  it('shows IT, then a hospitality divider and timeline, newest first, with end years as steps', async () => {
    // Arrange & Act
    const { element, timelines, headersOf } = await render();

    // Assert
    expect(timelines.map((t) => t.getAttribute('aria-label'))).toEqual([
      'IT',
      'Hospitality',
    ]);
    // only the switch to hospitality is labelled on the page
    const titles = element.querySelectorAll('ds-timeline-divider h2');
    expect(Array.from(titles).map((t) => t.textContent?.trim())).toEqual([
      'Hospitality',
    ]);
    expect(timelines[0].compareDocumentPosition(titles[0])).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    // every group has an h2 (IT's only for screen readers) with its jobs as h3
    expect(
      Array.from(element.querySelectorAll('h2')).map((h) =>
        h.textContent?.trim()
      )
    ).toEqual(['IT', 'Hospitality']);
    expect(element.querySelector('h2')?.classList).toContain(
      'cdk-visually-hidden'
    );
    for (const timeline of timelines) {
      expect(timeline.querySelectorAll('h3').length).toBe(
        headersOf(timeline).length
      );
    }

    for (const timeline of timelines) {
      // the end year, or "present" for a current job
      const years = headersOf(timeline).map((header) => {
        const badge = header
          .querySelector('.timeline__year')
          ?.textContent?.trim();
        return badge === 'present' ? Number.POSITIVE_INFINITY : Number(badge);
      });
      expect(years.length).toBeGreaterThan(0);
      expect(years.every((year) => year > 1990)).toBe(true);
      expect(years).toEqual([...years].sort((a, b) => b - a));
    }
    // positions are translation keys, rendered in English
    expect(element.textContent).not.toContain('t.');
  });

  it('marks internships in the step header and no longer shows the category', async () => {
    // Arrange & Act
    const { element } = await render();
    const chips = Array.from(element.querySelectorAll('.timeline-item__tag'));

    // Assert
    expect(chips.length).toBeGreaterThan(0);
    for (const chip of chips) {
      expect(chip.textContent?.trim()).toBe('Internship');
      expect(chip.closest('.timeline__header')).toBeTruthy();
    }
  });

  it('only shows the growth icon next to descriptions', async () => {
    // Arrange & Act
    const { element } = await render();
    const details = Array.from(
      element.querySelectorAll('.timeline-item__detail')
    ).filter(
      (d) => d.querySelector('mat-icon')?.textContent?.trim() === 'trending_up'
    );

    // Assert
    expect(details.length).toBeGreaterThan(0);
    for (const detail of details) {
      expect(
        detail.querySelector('.experience-list__description')
      ).toBeTruthy();
    }
    // every step has its period, but not every one has descriptions
    expect(
      element.querySelectorAll('.timeline__header').length
    ).toBeGreaterThan(details.length);
  });

  it('opens the newest IT job and makes internships and hospitality jobs not expandable', async () => {
    // Arrange & Act
    const { timelines, headersOf } = await render();

    // Assert
    expect(headersOf(timelines[0])[0].getAttribute('aria-expanded')).toBe(
      'true'
    );
    // no button, chevron or content for hospitality jobs
    const hospitality = headersOf(timelines[1]);
    expect(hospitality.length).toBeGreaterThan(0);
    for (const header of hospitality) {
      expect(header.tagName).toBe('DIV');
      expect(header.querySelector('.timeline__chevron')).toBeNull();
    }
    expect(timelines[1].querySelector('.timeline__content')).toBeNull();
    // internships don't expand either
    for (const tag of Array.from(
      timelines[0].querySelectorAll('.timeline-item__tag')
    )) {
      expect(tag.closest('.timeline__header')?.tagName).toBe('DIV');
    }
  });

  it('expands the newest step and another one on click', async () => {
    // Arrange & Act
    const { fixture, timelines, headersOf } = await render();
    const headers = headersOf(timelines[0]);

    // Assert
    expect(headers[0].getAttribute('aria-expanded')).toBe('true');
    expect(headers[1].getAttribute('aria-expanded')).toBe('false');

    // Act
    headers[1].click();
    await fixture.whenStable();

    // Assert
    expect(headers[0].getAttribute('aria-expanded')).toBe('false');
    expect(headers[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('lists the stack of a job as tags, in a row without icon or heading', async () => {
    // Arrange & Act
    const { element } = await render();
    const stacks = Array.from(
      element.querySelectorAll<HTMLElement>('.experience-list__stack')
    );

    // Assert
    expect(stacks.length).toBeGreaterThan(0);
    for (const stack of stacks) {
      expect(stack.tagName).toBe('UL');
      expect(stack.previousElementSibling).toBeNull();
      const row = stack.closest('ds-timeline-detail');
      expect(row?.querySelector('mat-icon')?.textContent?.trim()).toBe('');
      expect(stack.querySelectorAll('li').length).toBeGreaterThan(0);
    }
    const technologies = stacks.flatMap((stack) =>
      Array.from(stack.querySelectorAll('li')).map((li) =>
        li.textContent?.trim()
      )
    );
    expect(technologies).toContain('Angular');
  });

  it('shows projects in a row with their own icon, apart from the duties', async () => {
    // Arrange & Act
    const { element } = await render();
    const rows = Array.from(
      element.querySelectorAll<HTMLElement>('ds-timeline-detail')
    );
    const iconOf = (row: HTMLElement) =>
      row.querySelector('mat-icon')?.textContent?.trim();
    const projectRows = rows.filter((row) => iconOf(row) === 'folder_open');

    // Assert
    expect(projectRows.length).toBeGreaterThan(0);
    const projectTexts = projectRows.map((row) =>
      row.querySelector('.timeline-detail__content')?.textContent?.trim()
    );
    expect(projectTexts.every((text) => text && !text.startsWith('t.'))).toBe(
      true
    );
    for (const row of rows) {
      expect(row.querySelector('mat-icon')?.getAttribute('aria-hidden')).toBe(
        'true'
      );
    }
    // projects no longer sit with the duties next to the growth icon
    const duties = Array.from(
      element.querySelectorAll('.timeline-item__details p')
    ).map((p) => p.textContent?.trim());
    for (const text of projectTexts) {
      expect(duties).not.toContain(text);
    }
  });
});
