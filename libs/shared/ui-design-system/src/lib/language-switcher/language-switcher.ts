import { Component, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslatePipe } from '@tolgee/ngx';
import { LanguageTranslationKey } from '@cv/shared-util-i18n';

interface LanguageOption {
  code: string;
  labelKey: LanguageTranslationKey;
}

@Component({
  selector: 'ds-language-switcher',
  imports: [
    MatIconButton,
    MatDivider,
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
  readonly languageReset = output<void>();
}
