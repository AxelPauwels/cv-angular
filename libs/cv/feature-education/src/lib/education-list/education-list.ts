import { Component, computed, inject } from '@angular/core';
import {
  delayedLoading,
  LoadingSpinner,
  PageTitle,
  SectionHeading,
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
  TrainingStatus,
} from '@cv/cv-data-access-education';
import { TranslationKey } from '@cv/shared-util-i18n';

@Component({
  selector: 'cv-education-list',
  imports: [
    PageLayout,
    LoadingSpinner,
    PageTitle,
    SectionHeading,
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

  /** Shown instead of a year when a training has none */
  protected readonly statusKeys: Record<TrainingStatus, TranslationKey> = {
    COMPLETED: 't.education.training.status.COMPLETED',
    ONGOING: 't.education.training.status.ONGOING',
    RECURRING: 't.education.training.status.RECURRING',
  };

  /**
   * Some entries carry a note instead of a link, e.g. a retired certificate.
   * Links are external http(s) URLs or files served by the app (`/assets/...`).
   */
  protected isLink(url: string | undefined): boolean {
    return !!url && /^(https?:\/\/|\/assets\/)/.test(url);
  }
}
