import { Component, computed, inject } from '@angular/core';
import { delayedLoading } from '@cv/shared-util-loading';
import { LoadingSpinner } from '@cv/shared-ui-loading-spinner';
import { PageTitle, SectionHeading, PageLayout } from '@cv/shared-ui-page';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@tolgee/ngx';
import { Card } from '@cv/shared-ui-card';
import { byEndNewestFirst } from '@cv/shared-util-types';
import {
  Timeline,
  TimelineDivider,
  TimelineItem,
} from '@cv/shared-ui-timeline';
import {
  Education,
  EducationCategory,
  EducationLevel,
  EducationStore,
  TrainingStatus,
} from '@cv/cv-data-access-education';
import { SubheadingTranslationKey, TranslationKey } from '@cv/shared-util-i18n';

const CATEGORY_ORDER: readonly EducationCategory[] = ['IT', 'HORECA'];

/** A course without an end lasted within its start year */
const shown = (e: Education) => ({
  start: e.period.start,
  end: e.period.end ?? e.period.start,
});

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
    TimelineDivider,
    TimelineItem,
    TranslatePipe,
  ],
  templateUrl: './education-list.html',
  styleUrl: './education-list.scss',
})
export class EducationList {
  protected readonly store = inject(EducationStore);
  protected readonly loading = delayedLoading(() => this.store.isLoading());

  /**
   * One timeline per category, in this order; empty ones are left out. The
   * hospitality group shows as one step spanning all its schools.
   */
  protected readonly groups = computed(() => {
    const educations = [...this.store.educations()].sort((a, b) =>
      byEndNewestFirst(shown(a), shown(b))
    );
    return CATEGORY_ORDER.map((category) => {
      const inCategory = educations.filter((e) => e.category === category);
      const periods = inCategory.map(shown);
      return {
        category,
        educations: inCategory,
        period: {
          start: new Date(Math.min(...periods.map((p) => +p.start))),
          end: new Date(Math.max(...periods.map((p) => +p.end))),
        },
      };
    }).filter((group) => group.educations.length > 0);
  });

  protected readonly categoryKeys: Record<
    EducationCategory,
    SubheadingTranslationKey
  > = {
    IT: 't.subheading.it',
    HORECA: 't.subheading.horeca',
  };

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
