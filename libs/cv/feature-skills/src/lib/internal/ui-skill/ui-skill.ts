import { Component, input } from '@angular/core';
import { ProgressDots } from '@cv/shared-ui-progress-dots';

/**
 * One skill on one line: its icon, its name and five dots for its level (one dot
 * per level); `index` staggers its dots after the skills above it.
 */
@Component({
  selector: 'cv-ui-skill',
  imports: [ProgressDots],
  templateUrl: './ui-skill.html',
  styleUrl: './ui-skill.scss',
})
export class UiSkill {
  readonly name = input.required<string>();
  /** Icon from the cv icon font, e.g. `angular` for `cv-icon-angular`; decorative */
  readonly icon = input.required<string>();
  /** 0–5 scale */
  readonly level = input.required<number>();
  /** Position in its list, to fill the dots one row after the other */
  readonly index = input(0);
}
