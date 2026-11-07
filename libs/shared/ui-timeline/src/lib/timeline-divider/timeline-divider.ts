import { Component, input } from '@angular/core';

@Component({
  selector: 'ds-timeline-divider',
  templateUrl: './timeline-divider.html',
  styleUrl: './timeline-divider.scss',
})
export class TimelineDivider {
  readonly label = input.required<string>();
  readonly headingLevel = input<2 | 3>(2);
}
