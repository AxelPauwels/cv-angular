import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatTabLink, MatTabNav, MatTabNavPanel } from '@angular/material/tabs';
import { TranslatePipe } from '@tolgee/ngx';
import { NavItem } from '../nav-item';

/**
 * Links resolve relative to the route that renders this navbar (the domain shell);
 * the projected content is the tab panel it controls
 */
@Component({
  selector: 'ds-sub-navbar',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatTabNav,
    MatTabLink,
    MatTabNavPanel,
    TranslatePipe,
  ],
  templateUrl: './sub-navbar.html',
  styleUrl: './sub-navbar.scss',
})
export class SubNavbar {
  readonly items = input.required<NavItem[]>();
  /** Translation key of the navigation's accessible name */
  readonly labelKey = input.required<string>();
}
