import { Component, input } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@tolgee/ngx';

@Component({
  selector: 'ds-loading-spinner',
  imports: [MatProgressSpinner, TranslatePipe],
  template: `
    <mat-progress-spinner
      mode="indeterminate"
      [diameter]="diameter()"
      [attr.aria-label]="label() | translate" />
  `,
  styles: `
    :host {
      display: flex;
      justify-content: center;
      padding-block: 3rem;
    }
  `,
})
export class LoadingSpinner {
  readonly label = input('t.common.loading');
  readonly diameter = input(50);
}
