import { Component, input } from '@angular/core';
import { SkillEntry } from '@cv/cv-data-access-skills';
import { UiSkill } from '../ui-skill/ui-skill';

/** The skills of one category, as a list: the content of a skill card */
@Component({
  selector: 'cv-ui-skill-list',
  imports: [UiSkill],
  templateUrl: './ui-skill-list.html',
  styleUrl: './ui-skill-list.scss',
})
export class UiSkillList {
  readonly entries = input.required<SkillEntry[]>();
}
