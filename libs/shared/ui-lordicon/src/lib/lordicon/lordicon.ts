import {
  afterNextRender,
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  input,
} from '@angular/core';

/**
 * Lordicon icons this app ships, by what they show. The JSON files live in this
 * lib's `src/assets` folder and are served from `assets/lordicon/`, so a visitor
 * never makes a request to Lordicon's CDN.
 */
const ICONS = {
  github: 'acgiczyg',
  linkedin: 'bnzbstbp',
  mail: 'icuxkywm',
} as const;

export type LordiconName = keyof typeof ICONS;

let elementDefined: Promise<void> | undefined;

/**
 * The Lordicon player (~60 kB gzipped) is its own chunk, loaded the first time an
 * icon renders in the browser, and defined once for the whole app.
 */
function defineLordiconElement(): Promise<void> {
  elementDefined ??= import('@lordicon/element').then(({ defineElement }) =>
    defineElement()
  );
  return elementDefined;
}

/**
 * An animated Lordicon icon that plays once when its `target` (the link or button
 * around it, by default) is hovered or gets keyboard focus. It never plays on page
 * load or scroll, and stays still with reduced motion.
 *
 * Decorative: hidden from screen readers, so the control around it needs its own
 * name. Content inside it shows until the icon is ready, so project a static
 * icon as a placeholder to avoid a blank space or a layout shift:
 *
 * ```html
 * <a href="mailto:…">
 *   <ds-lordicon icon="mail"><span class="cv-icon cv-icon-mail"></span></ds-lordicon>
 *   Email
 * </a>
 * ```
 *
 * Size it with `font-size` or `--ds-lordicon-size` (1em by default). The colors
 * follow the theme (`--mat-sys-primary`); override them with `--lord-icon-primary`
 * and `--lord-icon-secondary`.
 */
@Component({
  selector: 'ds-lordicon',
  template: `
    <lord-icon
      class="lordicon"
      [attr.src]="src()"
      [attr.target]="target()"
      [attr.stroke]="stroke()"
      trigger="hover"
      loading="lazy">
      <ng-content />
    </lord-icon>
  `,
  styleUrl: './lordicon.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  host: { 'aria-hidden': 'true' },
})
export class Lordicon {
  readonly icon = input.required<LordiconName>();
  /** Selector of the ancestor whose hover or focus plays the icon */
  readonly target = input('a, button');
  readonly stroke = input<'light' | 'regular' | 'bold'>('bold');

  protected readonly src = computed(
    () => `assets/lordicon/${ICONS[this.icon()]}.json`
  );

  constructor() {
    afterNextRender(() => void defineLordiconElement());
  }
}
