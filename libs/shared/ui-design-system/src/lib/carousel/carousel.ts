import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  Directive,
  DOCUMENT,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@tolgee/ngx';

let nextId = 0;

/** Marks a projected element as one slide of a `ds-carousel` (a list item) */
@Directive({
  selector: '[dsCarouselItem]',
  host: { role: 'listitem', class: 'ds-carousel__item' },
})
export class CarouselItem {}

@Component({
  selector: 'ds-carousel',
  imports: [MatIconButton, MatIcon, TranslatePipe],
  host: { '[class.ds-carousel--compact]': "itemSize() === 'compact'" },
  templateUrl: './carousel.html',
  styleUrl: './carousel.scss',
})
export class Carousel {
  private readonly document = inject(DOCUMENT);
  private readonly viewport =
    viewChild.required<ElementRef<HTMLElement>>('viewport');
  private readonly list = viewChild.required<ElementRef<HTMLElement>>('list');

  readonly label = input.required<string>();
  /** `compact`: narrower items, so more fit per view (2 to 5 instead of 1 to 4) */
  readonly itemSize = input<'regular' | 'compact'>('regular');

  protected readonly viewportId = `ds-carousel-${nextId++}`;
  protected readonly pages = signal(1);
  protected readonly page = signal(0);
  /** The page dots, with the (string) params of their "Page 1 of 3" label */
  protected readonly dots = computed(() =>
    Array.from({ length: this.pages() }, (_, index) => ({
      index,
      params: { current: String(index + 1), total: String(this.pages()) },
    }))
  );

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.update();
      // the carousel's width and the number of items both change the pages
      const observer = new ResizeObserver(() => this.update());
      observer.observe(this.viewport().nativeElement);
      observer.observe(this.list().nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected step(direction: -1 | 1): void {
    this.goTo(this.page() + direction);
  }

  protected goTo(page: number): void {
    const viewport = this.viewport().nativeElement;
    viewport.scrollTo({
      left: Math.max(0, page) * this.pageWidth(),
      behavior: this.reduceMotion() ? 'auto' : 'smooth',
    });
  }

  protected update(): void {
    const { scrollLeft, scrollWidth, clientWidth } =
      this.viewport().nativeElement;
    const pageWidth = this.pageWidth();
    // the scroller's padding (around the list) isn't part of the pages
    const padding = clientWidth - this.list().nativeElement.clientWidth;
    const pages = Math.max(
      1,
      // a little tolerance for fractional widths
      Math.ceil((scrollWidth - padding + this.gap()) / pageWidth - 0.01)
    );
    // 1px tolerance for fractional scroll positions; the last page may be partial
    const atEnd = scrollLeft + clientWidth >= scrollWidth - 1;
    this.pages.set(pages);
    this.page.set(
      atEnd
        ? pages - 1
        : Math.min(pages - 1, Math.round(scrollLeft / pageWidth))
    );
  }

  /** One page: the visible items (the list's width) plus the gap to the next one */
  private pageWidth(): number {
    return this.list().nativeElement.clientWidth + this.gap() || 1;
  }

  private gap(): number {
    const list = this.list().nativeElement;
    return parseFloat(getComputedStyle(list).columnGap) || 0;
  }

  /** The app's own setting (on <html>) or, without it, the system preference */
  private reduceMotion(): boolean {
    return (
      this.document.documentElement.hasAttribute('data-reduce-motion') ||
      !!this.document.defaultView?.matchMedia?.(
        '(prefers-reduced-motion: reduce)'
      ).matches
    );
  }
}
