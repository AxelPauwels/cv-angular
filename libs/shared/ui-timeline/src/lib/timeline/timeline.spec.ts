import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Timeline } from './timeline';
import { TimelineItem } from '../timeline-item/timeline-item';
import { TimelineDetail } from '../timeline-detail/timeline-detail';

@Component({
  imports: [Timeline, TimelineItem, TimelineDetail],
  template: `
    <ds-timeline
      label="Experience"
      [headingLevel]="headingLevel"
      [expandFirst]="expandFirst">
      <ds-timeline-item
        title="Developer"
        subtitle="Company · City"
        tag="Internship"
        endLabel="present"
        icon="work"
        [badge]="badge"
        [start]="start2021">
        <p class="projected">Built things</p>
        <ds-timeline-detail icon="stacks">
          <p class="extra">Angular</p>
        </ds-timeline-detail>
        <ds-timeline-detail>
          <p class="plain">No icon</p>
        </ds-timeline-detail>
      </ds-timeline-item>
      <ds-timeline-item title="Course" [badge]="badge" [start]="start2005" />
      <ds-timeline-item
        title="School"
        [badge]="badge"
        [start]="start2015"
        [end]="end2018" />
    </ds-timeline>
  `,
})
class Host {
  expandFirst = true;
  headingLevel: 2 | 3 = 2;
  badge: 'start' | 'end' = 'start';
  start2021 = new Date(2021, 0, 1);
  start2005 = new Date(2005, 0, 1);
  start2015 = new Date(2015, 0, 1);
  end2018 = new Date(2018, 0, 1);
}

@Component({
  imports: [Timeline, TimelineItem],
  template: `
    <ds-timeline label="Hospitality">
      <ds-timeline-item
        title="Waiter"
        subtitle="Cafe · City"
        badge="end"
        [start]="start"
        [end]="end"
        [expandable]="false" />
      <ds-timeline-item title="Chef" icon="work" [start]="start" contentOnly>
        <p class="projected">Only this</p>
      </ds-timeline-item>
    </ds-timeline>
  `,
})
class StaticHost {
  start = new Date(2010, 0, 1);
  end = new Date(2012, 0, 1);
}

describe('Timeline', () => {
  async function render(expandFirst = true) {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.expandFirst = expandFirst;
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    const headers = Array.from(
      element.querySelectorAll<HTMLElement>('.timeline__header')
    );
    return { fixture, element, headers };
  }

  const text = (node: Element | null | undefined) =>
    node?.textContent?.replace(/\s+/g, ' ').trim();

  it('is a labelled list with a button per item and the start years as badges', async () => {
    // Arrange & Act
    const { element, headers } = await render();

    // Assert
    expect(element.querySelector('.timeline')?.getAttribute('aria-label')).toBe(
      'Experience'
    );
    expect(
      headers.map((h) => text(h.querySelector('.timeline__year')))
    ).toEqual(['2021', '2005', '2015']);
  });

  it('shows the end years as badges, or the end label while ongoing', async () => {
    // Arrange
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.badge = 'end';

    // Act
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    // Assert: without an end or end label the start year stays
    expect(
      Array.from(element.querySelectorAll('.timeline__year')).map(text)
    ).toEqual(['present', '2005', '2018']);
  });

  it('shows a period within one year as just that year', async () => {
    // Arrange
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.end2018 = new Date(2015, 11, 1);

    // Act
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    // Assert
    const periods = Array.from(
      element.querySelectorAll('.timeline-item__detail > span')
    ).map(text);
    expect(periods.at(-1)).toBe('2015');
  });

  it('is an ordered list with each header button inside a heading', async () => {
    // Arrange & Act
    const { element, headers } = await render();

    // Assert
    const list = element.querySelector('.timeline');
    expect(list?.tagName).toBe('OL');
    expect(list?.querySelectorAll(':scope > li')).toHaveLength(3);
    // level 2 by default, directly under the page's h1
    expect(headers.map((h) => h.parentElement?.tagName)).toEqual([
      'H2',
      'H2',
      'H2',
    ]);
  });

  it('puts the header buttons in headings of the given level', async () => {
    // Arrange
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.headingLevel = 3;

    // Act
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    // Assert
    expect(element.querySelectorAll('h2')).toHaveLength(0);
    expect(element.querySelectorAll('h3 > .timeline__header')).toHaveLength(3);
  });

  it('shows title, tag and subtitle in the header', async () => {
    // Arrange & Act
    const { headers } = await render();

    // Assert
    expect(text(headers[0].querySelector('.timeline-item__title'))).toBe(
      'Developer Internship'
    );
    expect(text(headers[0].querySelector('.timeline-item__tag'))).toBe(
      'Internship'
    );
    expect(text(headers[0].querySelector('.timeline-item__subtitle'))).toBe(
      'Company · City'
    );
    expect(headers[1].querySelector('.timeline-item__tag')).toBeNull();
  });

  it('shows the period and the projected details next to their icons', async () => {
    // Arrange & Act
    const { element } = await render();
    const details = Array.from(
      element.querySelectorAll('.timeline-item__detail')
    );

    // Assert
    expect(text(details[0].querySelector('mat-icon'))).toBe('calendar_month');
    expect(text(details[0].querySelector('span'))).toBe('2021 – present');
    expect(text(details[1].querySelector('mat-icon'))).toBe('work');
    expect(text(details[1].querySelector('.timeline-item__details'))).toBe(
      'Built things'
    );
    expect(details[1].querySelector('.projected')).toBeTruthy();
  });

  it('shows ds-timeline-detail rows with their own icon below the details', async () => {
    // Arrange & Act
    const { element } = await render();
    const row = element.querySelector('ds-timeline-detail');

    // Assert
    expect(text(row?.querySelector('mat-icon') ?? null)).toBe('stacks');
    expect(row?.querySelector('mat-icon')?.getAttribute('aria-hidden')).toBe(
      'true'
    );
    expect(text(row?.querySelector('.timeline-detail__content') ?? null)).toBe(
      'Angular'
    );
    // without an icon an empty, hidden one keeps the text lined up
    const plain = element.querySelectorAll('ds-timeline-detail')[1];
    expect(text(plain.querySelector('mat-icon'))).toBe('');
    expect(plain.querySelector('mat-icon')?.getAttribute('aria-hidden')).toBe(
      'true'
    );
    expect(text(plain.querySelector('.timeline-detail__content'))).toBe(
      'No icon'
    );
    // a row of its own, not inside the work icon's details
    expect(row?.closest('.timeline-item__details')).toBeNull();
    const work = element.querySelectorAll('.timeline-item__detail')[1];
    expect(
      work.compareDocumentPosition(row as Node) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('expands one step at a time', async () => {
    // Arrange & Act
    const { fixture, element, headers } = await render();

    // Assert
    expect(headers.map((h) => h.getAttribute('aria-expanded'))).toEqual([
      'true',
      'false',
      'false',
    ]);

    // Act
    headers[2].click();
    await fixture.whenStable();

    // Assert
    expect(headers.map((h) => h.getAttribute('aria-expanded'))).toEqual([
      'false',
      'false',
      'true',
    ]);
    // every period is rendered; without an end date or end label only the start year shows
    const periods = Array.from(
      element.querySelectorAll('.timeline-item__detail > span')
    ).map(text);
    expect(periods).toEqual(['2021 – present', '2005', '2015 – 2018']);
  });

  it('closes an open item on a click and hides its content', async () => {
    // Arrange
    const { fixture, element, headers } = await render();

    // Act
    headers[0].click();
    await fixture.whenStable();

    // Assert
    expect(headers[0].getAttribute('aria-expanded')).toBe('false');
    const content = element.querySelector(
      `#${headers[0].getAttribute('aria-controls')}`
    );
    expect(content?.hasAttribute('inert')).toBe(true);
  });

  it('can start with every item collapsed', async () => {
    // Arrange & Act
    const { headers } = await render(false);

    // Assert
    expect(headers.map((h) => h.getAttribute('aria-expanded'))).toEqual([
      'false',
      'false',
      'false',
    ]);
  });

  it('renders a not expandable item as a plain header without content', async () => {
    // Arrange & Act
    const fixture = TestBed.createComponent(StaticHost);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    const [first, second] = Array.from(
      element.querySelectorAll<HTMLElement>('.timeline__header')
    );

    // Assert: not a button, no chevron, not opened by expandFirst
    expect(first.tagName).toBe('DIV');
    expect(first.classList).toContain('timeline__header--static');
    expect(first.hasAttribute('aria-expanded')).toBe(false);
    expect(first.querySelector('.timeline__chevron')).toBeNull();
    expect(first.parentElement?.tagName).toBe('H2');
    expect(text(first.querySelector('.timeline__year'))).toBe('2012');
    expect(
      Array.from(first.querySelectorAll('.timeline-item__subtitle')).map(text)
    ).toEqual(['Cafe · City']);
    const steps = element.querySelectorAll('.timeline__step');
    expect(steps[0].querySelector('.timeline__content')).toBeNull();
    expect(steps[0].classList).not.toContain('timeline__step--expanded');
    // the line to the next pill stays
    expect(
      steps[0].querySelector('.timeline__content-container--line')
    ).toBeTruthy();
    // other items still expand
    expect(second.tagName).toBe('BUTTON');
    // a content-only item shows just the projected content: no period or icon
    expect(steps[1].querySelector('.timeline-item__detail')).toBeNull();
    expect(steps[1].querySelector('mat-icon')).toBeNull();
    expect(text(steps[1].querySelector('.timeline__content-inner'))).toBe(
      'Only this'
    );
  });
});
