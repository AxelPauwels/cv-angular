import { Component, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslatePipe } from '@tolgee/ngx';
import { TranslationKey } from '@cv/shared-util-i18n';

interface ThemeOption {
  id: string;
  labelKey: TranslationKey;
  /** Options are listed in the given order; a divider separates consecutive groups */
  group?: string;
}

@Component({
  selector: 'ds-theme-switcher',
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
  templateUrl: './theme-switcher.html',
  styleUrl: './theme-switcher.scss',
})
export class ThemeSwitcher {
  readonly themes = input.required<readonly ThemeOption[]>();
  readonly theme = input.required<string>();
  readonly themeChange = output<string>();
  readonly themeReset = output<void>();
}
