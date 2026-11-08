import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import {
  MatCard,
  MatCardAvatar,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';

@Component({
  selector: 'ds-card',
  imports: [
    MatCard,
    MatCardAvatar,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatIcon,
  ],
  templateUrl: './card.html',
  styleUrl: './card.scss',
})
export class Card {
  readonly title = input<string>();
  readonly icon = input<string>();
  readonly iconFont = input<'cv' | 'material'>('cv');
  readonly initials = input<string>();
  readonly subtitle = input<string>();
  readonly tag = input<string>();
  readonly headingLevel = input<2 | 3>(2);
  /**
   * `brand`: a card in the header's colors (the app's `--ds-brand` and
   * `--ds-on-brand`, the theme's primary as a fallback); for tiles that should stand
   * out from the regular cards
   */
  readonly appearance = input<'default' | 'brand'>('default');
}
