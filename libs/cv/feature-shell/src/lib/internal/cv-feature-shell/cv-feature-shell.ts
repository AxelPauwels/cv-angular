import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavItem, SubNavbar } from '@cv/shared-ui-design-system';
import { ROUTES } from '@cv/shared-util-routing';

/** Layout of the CV domain: its sub navbar above the active page */
@Component({
  selector: 'lib-cv-feature-shell',
  imports: [RouterOutlet, SubNavbar],
  templateUrl: './cv-feature-shell.html',
  styleUrl: './cv-feature-shell.scss',
})
export class CvFeatureShell {
  protected readonly navItems: NavItem[] = [
    { label: 'Personal', path: ROUTES.CV.PERSONAL },
    { label: 'Education', path: ROUTES.CV.EDUCATION },
    { label: 'Experience', path: ROUTES.CV.EXPERIENCE },
    { label: 'Skills', path: ROUTES.CV.SKILLS },
    { label: 'References', path: ROUTES.CV.REFERENCES },
  ];
}
