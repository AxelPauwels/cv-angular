import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TimelineDivider } from './timeline-divider';

@Component({
  imports: [TimelineDivider],
  template: `
    <ds-timeline-divider label="Hospitality" />
    <ds-timeline-divider label="Courses" [headingLevel]="3" />
  `,
})
class Host {}

describe('TimelineDivider', () => {
  it('renders the label as a heading of the given level', async () => {
    // Arrange & Act
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    // Assert
    expect(element.querySelector('h2')?.textContent?.trim()).toBe(
      'Hospitality'
    );
    expect(element.querySelector('h3')?.textContent?.trim()).toBe('Courses');
  });
});
