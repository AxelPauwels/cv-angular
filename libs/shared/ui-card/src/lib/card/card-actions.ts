import { Directive } from '@angular/core';

/**
 * Marks content for the card's actions row: always at the bottom right of the
 * card, however tall the card is (e.g. stretched to its row in a grid).
 */
@Directive({ selector: '[dsCardActions]' })
export class CardActions {}
