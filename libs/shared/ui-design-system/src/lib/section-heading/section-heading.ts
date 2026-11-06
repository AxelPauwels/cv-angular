import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@tolgee/ngx';
import { SubheadingTranslationKey } from '@cv/shared-util-i18n';

/**
 * The `<h2>` on top of a page section, with an optional tagline below it. Pass
 * translation keys, and an id so the section can be named by its heading:
 *
 * ```html
 * <section aria-labelledby="personal-about-title">
 *   <ds-section-heading
 *     headingId="personal-about-title"
 *     title="t.subheading.personal.about-me"
 *     tagline="t.subheading.personal.about-me.description" />
 *   …
 * </section>
 * ```
 */
@Component({
  selector: 'ds-section-heading',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // the `title` input would also land on the host as a native tooltip showing the raw key
  host: { '[attr.title]': 'null' },
  template: `
    <hgroup class="ds-section-heading">
      <h2 class="ds-section-heading__title" [id]="headingId()">
        {{ title() | translate }}
      </h2>
      @if (tagline(); as tagline) {
        <p class="ds-section-heading__tagline">{{ tagline | translate }}</p>
      }
    </hgroup>
  `,
  styles: `
    :host {
      display: block;
      margin-top: 1.25rem;
    }

    .ds-section-heading {
      margin: 0 0 1.25rem;
    }

    .ds-section-heading__title {
      color: var(--mat-sys-primary);
      font: var(--mat-sys-headline-small);
      letter-spacing: 0.04em;
      margin: 0;
      text-transform: uppercase;
    }

    .ds-section-heading__tagline {
      color: var(--ds-primary-soft, var(--mat-sys-primary-container));
      font: var(--mat-sys-label-large);
      letter-spacing: 0.2em;
      margin: 0.25rem 0 0;
      text-transform: uppercase;
    }
  `,
})
export class SectionHeading {
  readonly headingId = input.required<string>();
  readonly title = input.required<SubheadingTranslationKey>();
  readonly tagline = input<SubheadingTranslationKey>();
}
