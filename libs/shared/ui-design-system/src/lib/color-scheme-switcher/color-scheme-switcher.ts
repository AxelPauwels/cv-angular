import { Component, computed, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslatePipe } from '@tolgee/ngx';

export type ColorSchemeOption = 'light' | 'dark';

/** Icon button that switches between light and dark mode; shows the mode it switches to */
@Component({
  selector: 'ds-color-scheme-switcher',
  imports: [MatIconButton, MatIcon, MatTooltip, TranslatePipe],
  templateUrl: './color-scheme-switcher.html',
  styleUrl: './color-scheme-switcher.scss',
})
export class ColorSchemeSwitcher {
  readonly colorScheme = input.required<ColorSchemeOption>();
  readonly colorSchemeChange = output<ColorSchemeOption>();

  protected readonly isDark = computed(() => this.colorScheme() === 'dark');

  protected toggle(): void {
    this.colorSchemeChange.emit(this.isDark() ? 'light' : 'dark');
  }
}
