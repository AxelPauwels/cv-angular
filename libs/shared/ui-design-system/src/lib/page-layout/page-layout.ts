import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** How wide a page's content gets: `narrow` for reading (e.g. timelines), `wide` for grids of cards */
export type PageLayoutWidth = 'narrow' | 'wide';

/**
 * The frame of a content page: the same padding on every page and a centered,
 * capped width. Wrap a page's whole template in it, page title included:
 * `<ds-page-layout width="narrow"><ds-page-title … /> …</ds-page-layout>`
 */
@Component({
  selector: 'ds-page-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    '[class.ds-page-layout--narrow]': `width() === 'narrow'`,
  },
  styles: `
    :host {
      --ds-page-layout-padding-inline: 1rem;
      --ds-page-layout-max-width: 72rem;

      box-sizing: border-box;
      display: block;
      margin-inline: auto;
      /* the content gets the full max width; the padding comes on top */
      max-width: calc(
        var(--ds-page-layout-max-width) + 2 *
          var(--ds-page-layout-padding-inline)
      );
      padding: 1.5rem var(--ds-page-layout-padding-inline) 3rem;
      width: 100%;
    }

    :host(.ds-page-layout--narrow) {
      --ds-page-layout-max-width: 52rem;
    }
  `,
})
export class PageLayout {
  readonly width = input<PageLayoutWidth>('wide');
}
