import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavItem, SubNavbar } from '@cv/shared-ui-design-system';
import { FeatureToggleService } from '@cv/shared-data-access';
import { SHOWCASE_NAV_ITEMS } from '../showcase-nav-items';

@Component({
  selector: 'showcase-feature-shell',
  imports: [RouterOutlet, SubNavbar],
  templateUrl: './showcase-feature-shell.html',
  styleUrl: './showcase-feature-shell.scss',
})
export class ShowcaseFeatureShell {
  private readonly toggles = inject(FeatureToggleService).states;

  /** The items switched off on the admin page are left out */
  protected readonly navItems = computed<NavItem[]>(() => {
    const toggles = this.toggles();
    return SHOWCASE_NAV_ITEMS.filter(
      ({ toggle }) => !toggle || toggles[toggle]
    );
  });
}
