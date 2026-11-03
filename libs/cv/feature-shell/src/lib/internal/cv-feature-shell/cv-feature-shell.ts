import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavItem, SubNavbar } from '@cv/shared-ui-design-system';
import { ROUTES } from '@cv/shared-util-routing';

/** Layout of the CV domain: its sub navbar above the active page */
@Component({
  selector: 'cv-feature-shell',
  imports: [RouterOutlet, SubNavbar],
  templateUrl: './cv-feature-shell.html',
  styleUrl: './cv-feature-shell.scss',
})
export class CvFeatureShell {
  protected readonly navItems: NavItem[] = [
    { labelKey: 't.nav.personal', path: ROUTES.CV.PERSONAL },
    { labelKey: 't.nav.education', path: ROUTES.CV.EDUCATION },
    { labelKey: 't.nav.experience', path: ROUTES.CV.EXPERIENCE },
    { labelKey: 't.nav.skills', path: ROUTES.CV.SKILLS },
    { labelKey: 't.nav.references', path: ROUTES.CV.REFERENCES },
  ];
}
