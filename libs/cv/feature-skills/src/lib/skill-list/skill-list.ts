import { Component, inject } from '@angular/core';
import {
  delayedLoading,
  LoadingSpinner,
  PageTitle,
  PageLayout,
} from '@cv/shared-ui-design-system';
import { TranslatePipe } from '@tolgee/ngx';
import { SkillCategory, SkillStore } from '@cv/cv-data-access-skills';
import { Card } from '@cv/shared-ui-card';
import { LanguageService } from '@cv/shared-data-access-i18n';
import { UiSkillList } from '../internal/ui-skill-list/ui-skill-list';

@Component({
  selector: 'cv-skill-list',
  imports: [
    PageLayout,
    LoadingSpinner,
    PageTitle,
    Card,
    TranslatePipe,
    UiSkillList,
  ],
  templateUrl: './skill-list.html',
  styleUrl: './skill-list.scss',
})
export class SkillList {
  protected readonly store = inject(SkillStore);
  protected readonly loading = delayedLoading(() => this.store.isLoading());
  protected readonly language = inject(LanguageService).language;

  protected readonly categoryKeys: Record<SkillCategory, string> = {
    CORE_STACK: 't.subheading.skills.core-stack',
    ENGINEERING_PRACTICES: 't.subheading.skills.engineering-practices',
    TESTING_AND_QUALITY: 't.subheading.skills.testing-and-quality',
    AI: 't.subheading.skills.ai',
    DEVELOPMENT_TOOLS: 't.subheading.skills.development-tools',
    ADDITIONAL_TECHNOLOGIES: 't.subheading.skills.additional-technologies',
  };
}
