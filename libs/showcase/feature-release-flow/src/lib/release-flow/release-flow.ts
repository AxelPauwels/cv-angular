import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TranslatePipe } from '@tolgee/ngx';
import { TranslationKey } from '@cv/shared-util-i18n';
import { TranslateListPipe, TranslatePartsPipe } from '@cv/shared-ui-i18n';
import { PageLayout, PageTitle } from '@cv/shared-ui-page';
import { MatButton } from '@angular/material/button';
import { Card, CardActions } from '@cv/shared-ui-card';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';

/** One card: a phase of the release flow and what happens in it */
interface Phase {
  readonly titleKey: TranslationKey;
  readonly subtitleKey: TranslationKey;
  readonly icon: string;
  readonly introKey?: TranslationKey;
  /** Numbered steps in order, or a plain list of options */
  readonly ordered: boolean;
  /** One key holding every item, separated by `||` (see `translateList`) */
  readonly listKey: TranslationKey;
  readonly noteKey?: TranslationKey;
}

/**
 * How this site is released: a Claude Code skill pushes `develop` and fixes
 * failing checks, proposes the version, creates the release branch and pull
 * request, and brings `main` back into `develop` after the merge. Static text
 * only: no data is fetched.
 */
@Component({
  selector: 'showcase-release-flow',
  imports: [
    PageLayout,
    PageTitle,
    Card,
    CardActions,
    MatButton,
    MatChip,
    MatChipSet,
    MatIcon,
    NgTemplateOutlet,
    TranslatePipe,
    TranslatePartsPipe,
    TranslateListPipe,
  ],
  templateUrl: './release-flow.html',
  styleUrl: './release-flow.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReleaseFlow {
  private readonly repoUrl = 'https://github.com/AxelPauwels/cv-angular';
  protected readonly skillUrl = `${this.repoUrl}/blob/main/.claude/skills/release-flow/SKILL.md`;
  protected readonly guideUrl = `${this.repoUrl}/blob/main/README.release-by-skills.md`;

  protected readonly phases: readonly Phase[] = [
    {
      titleKey: 't.release-flow.push.title',
      subtitleKey: 't.release-flow.push.subtitle',
      icon: 'terminal',
      ordered: true,
      listKey: 't.release-flow.push.steps',
    },
    {
      titleKey: 't.release-flow.version.title',
      subtitleKey: 't.release-flow.version.subtitle',
      icon: 'trending_up',
      introKey: 't.release-flow.version.intro',
      ordered: false,
      listKey: 't.release-flow.version.bumps',
      noteKey: 't.release-flow.version.nothing',
    },
    {
      titleKey: 't.release-flow.branch.title',
      subtitleKey: 't.release-flow.branch.subtitle',
      icon: 'deployed_code',
      ordered: true,
      listKey: 't.release-flow.branch.steps',
    },
    {
      titleKey: 't.release-flow.merge.title',
      subtitleKey: 't.release-flow.merge.subtitle',
      icon: 'verified',
      ordered: true,
      listKey: 't.release-flow.merge.steps',
    },
  ];
}
