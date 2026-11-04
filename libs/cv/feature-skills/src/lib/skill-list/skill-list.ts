import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@tolgee/ngx';
import { SkillCategory, SkillStore } from '@cv/cv-data-access-skills';

@Component({
  selector: 'cv-skill-list',
  imports: [TranslatePipe],
  templateUrl: './skill-list.html',
})
export class SkillList {
  protected readonly store = inject(SkillStore);

  protected readonly categoryKeys: Record<SkillCategory, string> = {
    PROGRAMMING_LANGUAGES: 't.subheading.programming-languages',
    FRAMEWORKS: 't.subheading.frameworks',
    LIBRARIES: 't.subheading.libraries',
    OPERATING_SYSTEMS: 't.subheading.operating-systems',
    VERSION_CONTROL: 't.subheading.version-control',
  };
}
