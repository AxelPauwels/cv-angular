import { Component, ElementRef, input, viewChild } from '@angular/core';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatTabLink, MatTabNav, MatTabNavPanel } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslatePipe } from '@tolgee/ngx';
import { NavItem } from '../nav-item';
import { TranslationKey } from '@cv/shared-util-i18n';

@Component({
  selector: 'ds-sub-navbar',
  imports: [
    CdkScrollable,
    RouterLink,
    RouterLinkActive,
    MatTabNav,
    MatTabLink,
    MatTabNavPanel,
    MatIcon,
    MatTooltip,
    TranslatePipe,
  ],
  templateUrl: './sub-navbar.html',
  styleUrl: './sub-navbar.scss',
  host: {
    '(document:keydown)': 'scrollFromPage($event)',
  },
})
export class SubNavbar {
  readonly items = input.required<NavItem[]>();
  readonly labelKey = input.required<TranslationKey>();
  private readonly panel = viewChild.required('panel', { read: ElementRef });

  /**
   * The page scrolls in the panel (from md up), not in the window. With nothing
   * focused the browser would send Space, Page Up/Down, Home, End and the arrows
   * to the window, which doesn't scroll, so they scroll the panel instead.
   */
  protected scrollFromPage(event: KeyboardEvent): void {
    const panel: HTMLElement = this.panel().nativeElement;
    if (
      event.defaultPrevented ||
      event.target !== panel.ownerDocument.body ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      panel.scrollHeight <= panel.clientHeight
    ) {
      return;
    }
    const page = panel.clientHeight * 0.875;
    const line = 40;
    const by: Partial<Record<string, number>> = {
      ArrowDown: line,
      ArrowUp: -line,
      PageDown: page,
      PageUp: -page,
      ' ': event.shiftKey ? -page : page,
      Home: -panel.scrollHeight,
      End: panel.scrollHeight,
    };
    const top = by[event.key];
    if (top !== undefined) {
      event.preventDefault();
      panel.scrollBy({ top });
    }
  }
}
