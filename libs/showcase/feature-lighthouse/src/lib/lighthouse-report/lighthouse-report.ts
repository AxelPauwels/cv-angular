import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { TranslatePipe } from '@tolgee/ngx';
import { LanguageService } from '@cv/shared-data-access-i18n';
import { PageTitle } from '@cv/shared-ui-page';
import {
  LIGHTHOUSE_CATEGORIES,
  LIGHTHOUSE_RUN,
  LIGHTHOUSE_SECTIONS,
} from '../internal/lighthouse-pages';
import { ScoreGauge } from '../internal/score-gauge/score-gauge';

/**
 * The Google Lighthouse scores (desktop) of every page of the deployed app, as a
 * tree: each main menu item with its sub menu items, one row of four scores each.
 */
@Component({
  selector: 'showcase-lighthouse-report',
  imports: [PageTitle, ScoreGauge, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lighthouse-report.html',
  styleUrl: './lighthouse-report.scss',
})
export class LighthouseReport {
  private readonly language = inject(LanguageService).language;

  protected readonly categories = LIGHTHOUSE_CATEGORIES;
  protected readonly sections = LIGHTHOUSE_SECTIONS;
  protected readonly run = LIGHTHOUSE_RUN;

  /** The date of the run, in the active language */
  protected readonly measuredOn = computed(() =>
    new Intl.DateTimeFormat(this.language(), { dateStyle: 'long' }).format(
      new Date(this.run.fetchTime)
    )
  );
}
