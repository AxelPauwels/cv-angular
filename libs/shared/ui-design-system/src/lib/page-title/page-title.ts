import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@tolgee/ngx';
import {
  HeadingTranslationKey,
  SubheadingTranslationKey,
} from '@cv/shared-util-i18n';

/**
 * The one `<h1>` on top of a content page; pass the heading's translation key,
 * and optionally a subtitle shown underneath it (grouped with the heading):
 * `<ds-page-title title="t.heading.references" />`
 * `<ds-page-title title="t.heading.administrator" subtitle="t.subheading.administrator" />`
 */
@Component({
  selector: 'ds-page-title',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // the `title` input would also land on the host as a native tooltip showing the raw key
  host: { '[attr.title]': 'null' },
  template: `
    @if (subtitle(); as subtitle) {
      <hgroup class="ds-page-title__group">
        <h1 class="ds-page-title ds-page-title--with-subtitle">
          {{ title() | translate }}
        </h1>
        <p class="ds-page-title__subtitle">{{ subtitle | translate }}</p>
      </hgroup>
    } @else {
      <h1 class="ds-page-title">{{ title() | translate }}</h1>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    .ds-page-title {
      color: var(--mat-sys-primary);
      font: var(--mat-sys-display-small);
      letter-spacing: 0.08em;
      margin: 0.5rem 0 2rem;
      text-align: center;
      text-transform: uppercase;
    }

    .ds-page-title--with-subtitle {
      margin-block-end: 0.25rem;
    }

    .ds-page-title__group {
      margin: 0 0 2rem;
    }

    .ds-page-title__subtitle {
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-title-medium);
      font-style: italic;
      margin: 0;
      text-align: center;
    }
  `,
})
export class PageTitle {
  readonly title = input.required<HeadingTranslationKey>();
  readonly subtitle = input<SubheadingTranslationKey>();
}
