import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'ds-progress-dots',
  templateUrl: './progress-dots.html',
  styleUrl: './progress-dots.scss',
  host: {
    '[attr.role]': "label() ? 'meter' : null",
    '[attr.aria-label]': 'label() ?? null',
    '[attr.aria-valuenow]': 'label() ? filled() : null',
    '[attr.aria-valuemin]': 'label() ? 0 : null',
    '[attr.aria-valuemax]': 'label() ? max() : null',
    '[attr.aria-hidden]': "label() ? null : 'true'",
    '[style.--ds-progress-dots-index]': 'index()',
  },
})
export class ProgressDots {
  /** Number of filled dots, from 0 to `max`; rounded down */
  readonly value = input.required<number>();
  /** Number of dots */
  readonly max = input(5);
  /** Accessible name, e.g. the skill; leave it out when the dots are decorative */
  readonly label = input<string>();
  /** Position in its list, so the rows fill one after the other */
  readonly index = input(0);

  protected readonly filled = computed(() =>
    Math.min(this.max(), Math.max(0, Math.floor(this.value())))
  );

  protected readonly dots = computed(() => {
    const max = Math.max(1, this.max());
    return Array.from({ length: max }, (_, position) => ({
      position,
      filled: position < this.filled(),
    }));
  });
}
