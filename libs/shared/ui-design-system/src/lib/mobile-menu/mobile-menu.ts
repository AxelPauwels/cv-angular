import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslatePipe } from '@tolgee/ngx';
import { NavTranslationKey } from '@cv/shared-util-i18n';

let nextId = 0;

/**
 * A hamburger button that shows and hides a panel with the projected content
 * (e.g. a `ds-nav-accordion`), for phones (< 600px; hidden on wider screens).
 * A disclosure: the button says whether the panel is open, Escape and every
 * navigation close it. Place it in a `ds-main-navbar` with `dsNavbarStart`.
 */
@Component({
  selector: 'ds-mobile-menu',
  imports: [MatIconButton, MatIcon, MatTooltip, TranslatePipe],
  templateUrl: './mobile-menu.html',
  styleUrl: './mobile-menu.scss',
  host: {
    '(keydown.escape)': 'closeFromKeyboard()',
  },
})
export class MobileMenu {
  readonly open = model(false);
  readonly labelKey = input<NavTranslationKey>('t.nav.menu');

  protected readonly panelId = `ds-mobile-menu-panel-${nextId++}`;
  private readonly button = viewChild.required('button', { read: ElementRef });
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');

  constructor() {
    const subscription = inject(Router).events.subscribe((event) => {
      if (event instanceof NavigationEnd && this.open()) {
        this.close();
      }
    });
    inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
  }

  protected toggle(): void {
    this.open.update((open) => !open);
  }

  protected closeFromKeyboard(): void {
    if (this.open()) {
      this.close();
    }
  }

  /** Focus would get lost in the hidden panel: it goes back to the button */
  private close(): void {
    const panel = this.panel().nativeElement;
    const focusInPanel = panel.contains(panel.ownerDocument.activeElement);
    this.open.set(false);
    if (focusInPanel) {
      (this.button().nativeElement as HTMLElement).focus();
    }
  }
}
