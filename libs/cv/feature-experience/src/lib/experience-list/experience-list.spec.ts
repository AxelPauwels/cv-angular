import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { ExperienceList } from './experience-list';

describe('ExperienceList', () => {
  function create() {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
        provideI18nTesting(),
      ],
    });
    return TestBed.createComponent(ExperienceList);
  }

  async function render(fixture = create()) {
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    const timelines = Array.from(
      element.querySelectorAll<HTMLElement>('.timeline')
    );
    const headersOf = (timeline: HTMLElement) =>
      Array.from(timeline.querySelectorAll<HTMLElement>('.timeline__header'));
    return { fixture, element, timelines, headersOf };
  }

  it('marks internships in the step header and no longer shows the category', async () => {
    // Arrange
    const { element } = await render();

    // Act
    const chips = Array.from(element.querySelectorAll('.timeline-item__tag'));

    // Assert
    expect(chips.length).toBeGreaterThan(0);
    for (const chip of chips) {
      expect(chip.textContent?.trim()).toBe('Internship');
      expect(chip.closest('.timeline__header')).toBeTruthy();
    }
  });

  it('only shows the growth icon next to descriptions', async () => {
    // Arrange
    const { element } = await render();

    // Act
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
    // Arrange
    const fixture = create();

    // Act
    const { timelines, headersOf } = await render(fixture);

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

  it('expands the newest step', async () => {
    // Arrange
    const fixture = create();

    // Act
    const { timelines, headersOf } = await render(fixture);

    // Assert
    const headers = headersOf(timelines[0]);
    expect(headers[0].getAttribute('aria-expanded')).toBe('true');
    expect(headers[1].getAttribute('aria-expanded')).toBe('false');
  });

  it('expands another step on click', async () => {
    // Arrange
    const { fixture, timelines, headersOf } = await render();
    const headers = headersOf(timelines[0]);

    // Act
    headers[1].click();
    await fixture.whenStable();

    // Assert
    expect(headers[0].getAttribute('aria-expanded')).toBe('false');
    expect(headers[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('lists the stack of a job as tags, in a row without icon or heading', async () => {
    // Arrange
    const { element } = await render();

    // Act
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
});
