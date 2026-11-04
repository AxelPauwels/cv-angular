import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@tolgee/ngx';
import { ExperienceStore } from '@cv/cv-data-access-experience';

@Component({
  selector: 'cv-experience-list',
  imports: [DatePipe, TranslatePipe],
  templateUrl: './experience-list.html',
})
export class ExperienceList {
  protected readonly store = inject(ExperienceStore);
}
