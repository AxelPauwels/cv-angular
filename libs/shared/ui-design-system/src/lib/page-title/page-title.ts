import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@tolgee/ngx';
import { HeadingTranslationKey } from '@cv/shared-util-i18n';

/**
 * The one `<h1>` on top of a content page; pass the heading's translation key:
 * `<ds-page-title title="t.heading.references" />`
 */
@Component({
  selector: 'ds-page-title',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // the `title` input would also land on the host as a native tooltip showing the raw key
  host: { '[attr.title]': 'null' },
  template: `<h1 class="ds-page-title">{{ title() | translate }}</h1>`,
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
  `,
})
export class PageTitle {
  readonly title = input.required<HeadingTranslationKey>();
}
