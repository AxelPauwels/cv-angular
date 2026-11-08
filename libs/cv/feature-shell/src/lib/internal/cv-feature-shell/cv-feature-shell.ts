import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavItem, SubNavbar } from '@cv/shared-ui-design-system';
import { ROUTES } from '@cv/shared-util-routing';
import { FeatureToggleId, FeatureToggleService } from '@cv/shared-data-access';

@Component({
  selector: 'cv-feature-shell',
  imports: [RouterOutlet, SubNavbar],
  templateUrl: './cv-feature-shell.html',
  styleUrl: './cv-feature-shell.scss',
})
export class CvFeatureShell {
  private readonly toggles = inject(FeatureToggleService).states;

  private readonly allNavItems: (NavItem & { toggle?: FeatureToggleId })[] = [
    { labelKey: 't.nav.home', path: ROUTES.CV.HOME, icon: 'home' },
    {
      labelKey: 't.nav.personal',
      path: ROUTES.CV.PERSONAL,
      toggle: 'cv-personal',
    },
    {
      labelKey: 't.nav.education',
      path: ROUTES.CV.EDUCATION,
      toggle: 'cv-education',
    },
    {
      labelKey: 't.nav.experience',
      path: ROUTES.CV.EXPERIENCE,
      toggle: 'cv-experience',
    },
    { labelKey: 't.nav.skills', path: ROUTES.CV.SKILLS, toggle: 'cv-skills' },
    {
      labelKey: 't.nav.references',
      path: ROUTES.CV.REFERENCES,
      toggle: 'cv-references',
    },
  ];

  /** The items switched off on the admin page are left out */
  protected readonly navItems = computed<NavItem[]>(() => {
    const toggles = this.toggles();
    return this.allNavItems.filter(({ toggle }) => !toggle || toggles[toggle]);
  });
}
