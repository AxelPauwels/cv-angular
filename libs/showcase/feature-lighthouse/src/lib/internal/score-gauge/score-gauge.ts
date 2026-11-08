import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { scoreRating } from '../lighthouse-pages';

/** The circumference of the gauge's circle (r = 56), as in Lighthouse's report */
const CIRCUMFERENCE = 2 * Math.PI * 56;

/**
 * A Lighthouse score gauge: a ring filled up to the score, colored by its band,
 * with the score in the middle. Only the number is read out; the ring is decoration.
 */
@Component({
  selector: 'showcase-score-gauge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'score-gauge',
    '[class]': "'score-gauge--' + rating()",
  },
  template: `
    <svg class="score-gauge__svg" viewBox="0 0 120 120" aria-hidden="true">
      <circle class="score-gauge__base" r="56" cx="60" cy="60" />
      <circle
        class="score-gauge__arc"
        r="56"
        cx="60"
        cy="60"
        [attr.stroke-dasharray]="dashArray()" />
    </svg>
    <span class="score-gauge__value">{{ score() }}</span>
  `,
  styleUrl: './score-gauge.scss',
})
export class ScoreGauge {
  /** From 0 to 100 */
  readonly score = input.required<number>();

  protected readonly rating = computed(() => scoreRating(this.score()));

  protected readonly dashArray = computed(() => {
    const filled =
      (Math.min(Math.max(this.score(), 0), 100) / 100) * CIRCUMFERENCE;
    return `${filled} ${CIRCUMFERENCE}`;
  });
}
