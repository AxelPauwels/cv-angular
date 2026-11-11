import { Component, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslatePipe } from '@tolgee/ngx';

interface FontOption {
  id: string;
  label: string;
}

@Component({
  selector: 'ds-font-switcher',
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
  templateUrl: './font-switcher.html',
  styleUrl: './font-switcher.scss',
})
export class FontSwitcher {
  readonly fonts = input.required<readonly FontOption[]>();
  readonly font = input.required<string>();
  readonly fontChange = output<string>();
  readonly fontReset = output<void>();
}
