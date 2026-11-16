import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@tolgee/ngx';
import { TranslationKey } from '@cv/shared-util-i18n';

/**
 * The message a page shows when its store could not load its data. Pass a
 * translation key with an `{error}` parameter and the store's error:
 *
 * ```html
 * @if (store.error()) {
 *   <ds-store-loading-error
 *     message="t.error.load.experience"
 *     [error]="store.error()" />
 * }
 * ```
 *
 * It is an alert, so screen readers announce it when it replaces the spinner.
 */
@Component({
  selector: 'ds-store-loading-error',
  imports: [MatIcon, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'alert', class: 'ds-store-loading-error' },
  template: `
    <mat-icon
      class="ds-store-loading-error__icon"
      fontSet="material-symbols-outlined"
      aria-hidden="true"
      >error</mat-icon
    >
    <p class="ds-store-loading-error__message">
      {{ message() | translate: { error: error()?.message ?? '' } }}
    </p>
  `,
  styles: `
    :host {
      align-items: flex-start;
      color: var(--mat-sys-error);
      display: flex;
      gap: 0.5rem;
      padding-block: 1rem;
    }

    .ds-store-loading-error__icon {
      flex-shrink: 0;
    }

    .ds-store-loading-error__message {
      margin: 0;
    }
  `,
})
export class StoreLoadingError {
  /** A translation key whose text takes the error message as `{error}` */
  readonly message = input.required<TranslationKey>();
  readonly error = input<{ message: string } | null>();
}
