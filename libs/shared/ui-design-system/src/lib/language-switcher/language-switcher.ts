import { Component, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslatePipe } from '@tolgee/ngx';

export interface LanguageOption {
  code: string;
  /** Translation key of the language's name, e.g. `t.language.dutch` */
  labelKey: string;
}

/** Globe icon button; the menu lists the full language names and checks the active one */
@Component({
  selector: 'ds-language-switcher',
  imports: [
    MatIconButton,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatTooltip,
    TranslatePipe,
  ],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.scss',
})
export class LanguageSwitcher {
  readonly languages = input.required<readonly LanguageOption[]>();
  readonly language = input.required<string>();
  readonly languageChange = output<string>();
}
