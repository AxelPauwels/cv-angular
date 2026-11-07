import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'ds-progress-bar',
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.scss',
  host: {
    '[attr.role]': "label() ? 'progressbar' : null",
    '[attr.aria-label]': 'label() ?? null',
    '[attr.aria-valuenow]': 'label() ? percentage() : null',
    '[attr.aria-valuemin]': 'label() ? 0 : null',
    '[attr.aria-valuemax]': 'label() ? 100 : null',
    '[attr.aria-hidden]': "label() ? null : 'true'",
    '[style.--ds-progress-bar-index]': 'index()',
  },
})
export class ProgressBar {
  /** 0 to 100 */
  readonly value = input.required<number>();
  /** Accessible name, e.g. the skill; leave it out when the bar is decorative */
  readonly label = input<string>();
  /** Position in its list, so the bars fill one after the other */
  readonly index = input(0);

  protected readonly percentage = computed(() =>
    Math.min(100, Math.max(0, Math.round(this.value())))
  );
}
