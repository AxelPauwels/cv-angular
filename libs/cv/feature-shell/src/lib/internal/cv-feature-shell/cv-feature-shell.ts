import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavItem, SubNavbar } from '@cv/shared-ui-layout';
import { FeatureToggleService } from '@cv/shared-data-access';
import { CV_NAV_ITEMS } from '../../cv-nav-items';

@Component({
  selector: 'cv-feature-shell',
  imports: [RouterOutlet, SubNavbar],
  templateUrl: './cv-feature-shell.html',
  styleUrl: './cv-feature-shell.scss',
})
export class CvFeatureShell {
  private readonly toggles = inject(FeatureToggleService).states;

  /** The items switched off on the admin page are left out */
  protected readonly navItems = computed<NavItem[]>(() => {
    const toggles = this.toggles();
    return CV_NAV_ITEMS.filter(({ toggle }) => !toggle || toggles[toggle]);
  });
}
