import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatTabNavPanel } from '@angular/material/tabs';
import { MainNavbar, NavItem } from '@cv/shared/ui-design-system';
import { ROUTES } from '@cv/shared/util-routing';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, MatTabNavPanel, MainNavbar],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  protected readonly navItems: NavItem[] = [
    { label: 'CV', path: ROUTES.CV.ROOT },
    { label: 'Showcase', path: ROUTES.SHOWCASE.ROOT },
    { label: 'Technical', path: ROUTES.TECHNICAL.ROOT },
  ];

  // Todo i18n
  protected readonly year = new Date().getFullYear();
}
