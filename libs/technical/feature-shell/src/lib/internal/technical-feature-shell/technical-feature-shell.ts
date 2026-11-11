import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavItem, SubNavbar } from '@cv/shared-ui-layout';
import { FeatureToggleService } from '@cv/shared-data-access';
import { TECHNICAL_NAV_ITEMS } from '../../technical-nav-items';

/** Layout of the Technical domain: its sub navbar above the active page */
@Component({
  selector: 'technical-feature-shell',
  imports: [RouterOutlet, SubNavbar],
  templateUrl: './technical-feature-shell.html',
  styleUrl: './technical-feature-shell.scss',
})
export class TechnicalFeatureShell {
  private readonly toggles = inject(FeatureToggleService).states;

  /** The items switched off on the admin page are left out */
  protected readonly navItems = computed<NavItem[]>(() => {
    const toggles = this.toggles();
    return TECHNICAL_NAV_ITEMS.filter(({ toggle }) => toggles[toggle]);
  });
}
