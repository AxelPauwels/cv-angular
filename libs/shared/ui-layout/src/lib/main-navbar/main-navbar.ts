import { Component, input } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { MatTooltip } from '@angular/material/tooltip';
import { MatTabLink, MatTabNav, MatTabNavPanel } from '@angular/material/tabs';
import { TranslatePipe } from '@tolgee/ngx';
import { NavItem } from '../nav-item';
import { activeNavItem } from '../internal/active-nav-item';

/**
 * Toolbar with one tab per domain (an item with an `icon` shows the icon instead
 * of its label). The layout owns the content area: it passes
 * the `mat-tab-nav-panel` around its routed content as `tabPanel`. Projected
 * content (e.g. a language switcher) is shown at the end of the toolbar; content
 * marked `dsNavbarStart` (e.g. a `ds-mobile-menu`) at its start.
 *
 * Below md (< 768px: phones and small tablets) the tabs are hidden: a `ds-mobile-menu` takes their place.
 */
@Component({
  selector: 'ds-main-navbar',
  imports: [
    RouterLink,
    MatToolbar,
    MatTabNav,
    MatTabLink,
    MatIcon,
    MatTooltip,
    TranslatePipe,
    UpperCasePipe,
  ],
  templateUrl: './main-navbar.html',
  styleUrl: './main-navbar.scss',
})
export class MainNavbar {
  readonly items = input.required<NavItem[]>();
  readonly tabPanel = input.required<MatTabNavPanel>();
  /** Translation key of the navigation's accessible name */
  readonly labelKey = input('t.nav.main-navigation');

  protected readonly activeItem = activeNavItem(this.items);
}
