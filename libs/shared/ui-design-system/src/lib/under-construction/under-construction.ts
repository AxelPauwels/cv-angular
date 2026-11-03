import { Component, input } from '@angular/core';
import { TranslatePipe } from '@tolgee/ngx';
import { HeadingTranslationKey } from '@cv/shared-util-i18n';

/** Placeholder page until a sub navbar item gets its own content; `title` (a translation key) comes from route data */
@Component({
  selector: 'ds-under-construction',
  imports: [TranslatePipe],
  template: `
    <h1>{{ title() | translate }}</h1>
    <p>{{ 't.common.under-construction' | translate }}</p>
  `,
})
export class UnderConstruction {
  readonly title = input<HeadingTranslationKey | ''>('');
}
