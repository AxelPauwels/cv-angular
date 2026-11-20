import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@tolgee/ngx';
import { Card } from '@cv/shared-ui-card';

/**
 * `Roel Frison` -> `RF`: the first letters of the first and the last name
 * (same as on the references page)
 */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words.at(0);
  const last = words.length > 1 ? words.at(-1) : undefined;
  return [first, last]
    .map((word) => (word ? Array.from(word)[0] : ''))
    .join('')
    .toLocaleUpperCase();
}

/** `2021-03` -> `2021`; anything else is shown as is */
const toYear = (month: string): string => /^\d{4}/.exec(month)?.[0] ?? month;

/**
 * A reference as a card: who, their function, where and when we worked
 * together. Presentational only; the assistant fills the inputs.
 */
@Component({
  selector: 'showcase-person-card',
  imports: [Card, TranslatePipe],
  templateUrl: './person-card.html',
  styleUrl: './person-card.scss',
})
export class PersonCard {
  readonly name = input.required<string>();
  readonly function = input.required<string>();
  /** The employer the person worked at */
  readonly employer = input.required<string>();
  /** The employer's client where we worked together; empty when none */
  readonly client = input('');
  /** `YYYY-MM`; empty when unknown */
  readonly start = input('');
  /** `YYYY-MM`; empty while ongoing */
  readonly end = input('');

  protected readonly initials = computed(() => initials(this.name()));
  protected readonly startYear = computed(() => {
    const start = this.start();
    return start ? toYear(start) : undefined;
  });
  protected readonly endYear = computed(() => {
    const end = this.end();
    return end ? toYear(end) : undefined;
  });
}
