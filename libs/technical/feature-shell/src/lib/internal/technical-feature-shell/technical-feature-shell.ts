import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavItem, SubNavbar } from '@cv/shared-ui-design-system';
import { ROUTES } from '@cv/shared-util-routing';

/** Layout of the Technical domain: its sub navbar above the active page */
@Component({
  selector: 'lib-technical-feature-shell',
  imports: [RouterOutlet, SubNavbar],
  templateUrl: './technical-feature-shell.html',
  styleUrl: './technical-feature-shell.scss',
})
export class TechnicalFeatureShell {
  protected readonly navItems: NavItem[] = [
    { label: 'Versions', path: ROUTES.TECHNICAL.VERSIONS },
    { label: 'Demo1', path: ROUTES.TECHNICAL.DEMO1 },
  ];
}
