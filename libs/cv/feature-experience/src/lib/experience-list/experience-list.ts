import { Component, computed, inject } from '@angular/core';
import { delayedLoading } from '@cv/shared-util-loading';
import { LoadingSpinner } from '@cv/shared-ui-loading-spinner';
import { PageTitle, PageLayout } from '@cv/shared-ui-page';
import { TranslatePipe } from '@tolgee/ngx';
import { byEndNewestFirst } from '@cv/shared-util-types';
import {
  Timeline,
  TimelineDetail,
  TimelineDivider,
  TimelineItem,
} from '@cv/shared-ui-timeline';
import {
  Experience,
  ExperienceCategory,
  ExperienceStore,
} from '@cv/cv-data-access-experience';
import { SubheadingTranslationKey } from '@cv/shared-util-i18n';

/** Job descriptions with these keys list projects and get a row of their own */
const isProjects = (key: string) => key.endsWith('.projects');

const CATEGORY_ORDER: readonly ExperienceCategory[] = ['IT', 'HORECA'];

@Component({
  selector: 'cv-experience-list',
  imports: [
    PageLayout,
    LoadingSpinner,
    PageTitle,
    Timeline,
    TimelineDetail,
    TimelineDivider,
    TimelineItem,
    TranslatePipe,
  ],
  templateUrl: './experience-list.html',
  styleUrl: './experience-list.scss',
})
export class ExperienceList {
  protected readonly store = inject(ExperienceStore);
  protected readonly loading = delayedLoading(() => this.store.isLoading());

  /** One timeline per category, in this order; empty ones are left out */
  protected readonly groups = computed(() => {
    // an internship without an end lasted within its start year, it isn't ongoing
    const shown = (e: Experience) =>
      e.isInternship && !e.period.end
        ? { start: e.period.start, end: e.period.start }
        : e.period;
    const experiences = [...this.store.experiences()].sort((a, b) =>
      byEndNewestFirst(shown(a), shown(b))
    );

    return CATEGORY_ORDER.map((category) => ({
      category,
      experiences: experiences
        .filter((e) => e.category === category)
        .map((experience) => ({
          ...experience,
          // what the job was about, next to the growth icon
          duties: experience.jobDescriptions.filter((key) => !isProjects(key)),
          // the projects worked on, in a row with their own icon
          projects: experience.jobDescriptions.filter(isProjects),
        })),
    })).filter((group) => group.experiences.length > 0);
  });

  protected readonly categoryKeys: Record<
    ExperienceCategory,
    SubheadingTranslationKey
  > = {
    IT: 't.subheading.it',
    HORECA: 't.subheading.horeca',
  };
}
