import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'ds-timeline-detail',
  imports: [MatIcon],
  templateUrl: './timeline-detail.html',
  styleUrl: './timeline-detail.scss',
})
export class TimelineDetail {
  readonly icon = input<string>();
}
