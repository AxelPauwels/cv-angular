import { Component, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslatePipe } from '@tolgee/ngx';
import { TranslationKey } from '@cv/shared-util-i18n';

export type ColorSchemeOption = 'light' | 'dark';
interface Option {
  id: ColorSchemeOption;
  labelKey: TranslationKey;
}

@Component({
  selector: 'ds-color-scheme-switcher',
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
  templateUrl: './color-scheme-switcher.html',
  styleUrl: './color-scheme-switcher.scss',
})
export class ColorSchemeSwitcher {
  readonly colorScheme = input.required<ColorSchemeOption>();
  readonly colorSchemeChange = output<ColorSchemeOption>();
  readonly colorSchemeReset = output<void>();

  protected readonly options: Option[] = [
    { id: 'light', labelKey: 't.color-scheme.light' },
    { id: 'dark', labelKey: 't.color-scheme.dark' },
  ];
}
