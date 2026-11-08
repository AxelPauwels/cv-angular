import {
  booleanAttribute,
  Component,
  computed,
  input,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'ds-timeline-item',
  imports: [MatIcon, NgTemplateOutlet],
  templateUrl: './timeline-item.html',
  styleUrl: './timeline-item.scss',
})
export class TimelineItem {
  readonly start = input.required<Date>();
  readonly end = input<Date | null>();
  readonly endLabel = input<string>();
  readonly badge = input<'start' | 'end'>('start');
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly tag = input<string>();
  readonly icon = input<string>();
  readonly expandable = input(true);
  readonly contentOnly = input(false, { transform: booleanAttribute });
  readonly startYear = computed(() => this.start().getFullYear());

  readonly badgeLabel = computed(() => {
    const end = this.end();

    if (this.badge() === 'start') {
      return `${this.startYear()}`;
    }

    return end
      ? `${end.getFullYear()}`
      : (this.endLabel() ?? `${this.startYear()}`);
  });

  protected readonly period = computed(() => {
    const end = this.end();
    const until = end ? end.getFullYear() : this.endLabel();
    // a period within one year is just that year
    return until && until !== this.startYear()
      ? `${this.startYear()} – ${until}`
      : `${this.startYear()}`;
  });

  readonly header = viewChild.required<TemplateRef<unknown>>('header');
  readonly content = viewChild.required<TemplateRef<unknown>>('content');
}
