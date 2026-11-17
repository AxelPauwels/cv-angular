import { Component, ElementRef, input, output, viewChild } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { MatRipple } from '@angular/material/core';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslatePipe } from '@tolgee/ngx';

export interface AccessibilityOptions {
  textSize: number;
  reduceMotion: boolean;
  highContrast: boolean;
  wideTextSpacing: boolean;
}

let nextId = 0;

@Component({
  selector: 'ds-accessibility-switcher',
  imports: [
    MatIconButton,
    MatButtonToggle,
    MatButtonToggleGroup,
    MatDivider,
    MatIcon,
    MatRipple,
    MatSlideToggle,
    MatTooltip,
    TranslatePipe,
  ],
  templateUrl: './accessibility-switcher.html',
  styleUrl: './accessibility-switcher.scss',
  host: {
    '(keydown.escape)': 'closeFromKeyboard()',
  },
})
export class AccessibilitySwitcher {
  readonly textSizes = input.required<readonly number[]>();
  readonly settings = input.required<AccessibilityOptions>();
  readonly settingsChange = output<Partial<AccessibilityOptions>>();
  readonly resetSettings = output<void>();

  protected readonly id = `ds-accessibility-${nextId++}`;
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');

  /**
   * The popover closes itself on Escape, unless the trigger's tooltip shows
   * (after tabbing to it): that tooltip takes Escape for itself and cancels it
   * before it reaches the popover. Escape bubbles here first, so it closes
   * the panel anyway, and the browser moves the focus back to the trigger.
   */
  protected closeFromKeyboard(): void {
    const panel = this.panel().nativeElement;
    if (panel.matches(':popover-open')) {
      panel.hidePopover();
    }
  }
}
