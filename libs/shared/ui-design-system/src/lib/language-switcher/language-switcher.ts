import { Component, input, output } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { TranslatePipe } from '@tolgee/ngx';

export interface LanguageOption {
  code: string;
  /** Translation key of the language's name, e.g. `t.language.dutch` */
  labelKey: string;
}

/** Compact menu button with the active language code; the menu lists the full names */
@Component({
  selector: 'ds-language-switcher',
  imports: [
    MatButton,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    TranslatePipe,
    UpperCasePipe,
  ],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.scss',
})
export class LanguageSwitcher {
  readonly languages = input.required<readonly LanguageOption[]>();
  readonly language = input.required<string>();
  readonly languageChange = output<string>();
}
