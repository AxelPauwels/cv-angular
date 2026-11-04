import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavItem, SubNavbar } from '@cv/shared-ui-design-system';
import { ROUTES } from '@cv/shared-util-routing';

/** Layout of the Technical domain: its sub navbar above the active page */
@Component({
  selector: 'technical-feature-shell',
  imports: [RouterOutlet, SubNavbar],
  templateUrl: './technical-feature-shell.html',
  styleUrl: './technical-feature-shell.scss',
})
export class TechnicalFeatureShell {
  protected readonly navItems: NavItem[] = [
    { labelKey: 't.nav.architecture', path: ROUTES.TECHNICAL.ARCHITECTURE },
    {
      labelKey: 't.nav.project-graph',
      path: ROUTES.TECHNICAL.PROJECT_GRAPH,
    },
    { labelKey: 't.nav.versions', path: ROUTES.TECHNICAL.VERSIONS },
  ];
}
