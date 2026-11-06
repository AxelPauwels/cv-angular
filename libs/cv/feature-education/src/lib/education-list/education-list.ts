import { Component, computed, inject } from '@angular/core';
import {
  delayedLoading,
  LoadingSpinner,
  PageTitle,
  PageLayout,
} from '@cv/shared-ui-design-system';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@tolgee/ngx';
import { Card } from '@cv/shared-ui-card';
import { byEndNewestFirst } from '@cv/shared-util-types';
import { Timeline, TimelineItem } from '@cv/shared-ui-timeline';
import {
  Education,
  EducationLevel,
  EducationStore,
} from '@cv/cv-data-access-education';
import { TranslationKey } from '@cv/shared-util-i18n';

@Component({
  selector: 'cv-education-list',
  imports: [
    PageLayout,
    LoadingSpinner,
    PageTitle,
    Card,
    MatIcon,
    Timeline,
    TimelineItem,
    TranslatePipe,
  ],
  templateUrl: './education-list.html',
  styleUrl: './education-list.scss',
})
export class EducationList {
  protected readonly store = inject(EducationStore);
  protected readonly loading = delayedLoading(() => this.store.isLoading());

  protected readonly educations = computed(() => {
    const shown = (e: Education) => ({
      start: e.period.start,
      end: e.period.end ?? e.period.start,
    });
    return [...this.store.educations()].sort((a, b) =>
      byEndNewestFirst(shown(a), shown(b))
    );
  });

  protected readonly levelKeys: Record<EducationLevel, TranslationKey> = {
    SECONDARY_EDUCATION: 't.education.level.secondary',
    HIGH_SCHOOL: 't.education.level.high-school',
    CUSTOM_COURSE: 't.education.level.extra',
  };

  /** Some entries carry a note instead of a link, e.g. a retired certificate */
  protected isLink(url: string | undefined): boolean {
    return !!url && /^https?:\/\//.test(url);
  }
}
