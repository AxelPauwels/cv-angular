import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatTabNavPanel } from '@angular/material/tabs';
import {
  LanguageSwitcher,
  MainNavbar,
  NavItem,
} from '@cv/shared-ui-design-system';
import { isLanguageCode, LanguageService } from '@cv/shared-data-access-i18n';
import { ROUTES } from '@cv/shared-util-routing';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, MatTabNavPanel, MainNavbar, LanguageSwitcher],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  protected readonly languageService = inject(LanguageService);

  protected readonly navItems: NavItem[] = [
    { labelKey: 't.nav.cv', path: ROUTES.CV.ROOT },
    { labelKey: 't.nav.showcase', path: ROUTES.SHOWCASE.ROOT },
    { labelKey: 't.nav.technical', path: ROUTES.TECHNICAL.ROOT },
  ];

  protected changeLanguage(code: string): void {
    if (isLanguageCode(code)) {
      void this.languageService.changeLanguage(code);
    }
  }

  // Todo i18n
  protected readonly year = new Date().getFullYear();
}
