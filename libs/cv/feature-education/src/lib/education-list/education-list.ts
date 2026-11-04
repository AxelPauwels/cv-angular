import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@tolgee/ngx';
import { EducationLevel, EducationStore } from '@cv/cv-data-access-education';

@Component({
  selector: 'cv-education-list',
  imports: [DatePipe, TranslatePipe],
  templateUrl: './education-list.html',
})
export class EducationList {
  protected readonly store = inject(EducationStore);

  protected readonly levelKeys: Record<EducationLevel, string> = {
    SECONDARY_EDUCATION: 't.education.level.secondary',
    HIGH_SCHOOL: 't.education.level.high-school',
    CUSTOM_COURSE: 't.education.level.extra',
  };

  /** Some entries carry a note instead of a link, e.g. a retired certificate */
  protected isLink(url: string): boolean {
    return /^https?:\/\//.test(url);
  }
}
