import { Component, contentChildren, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CdkAccordion, CdkAccordionItem } from '@angular/cdk/accordion';
import { TimelineItem } from '../timeline-item/timeline-item';

let nextId = 0;

@Component({
  selector: 'ds-timeline',
  imports: [CdkAccordion, CdkAccordionItem, NgTemplateOutlet],
  templateUrl: './timeline.html',
  styleUrl: './timeline.scss',
})
export class Timeline {
  readonly label = input.required<string>();
  readonly headingLevel = input<2 | 3 | 4>(2);
  readonly expandFirst = input(true);

  protected readonly items = contentChildren(TimelineItem);
  protected readonly id = `ds-timeline-${nextId++}`;
}
