import {
  afterNextRender,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  signal,
} from '@angular/core';

/**
 * Marks a sideways scrolling container with `scroll-edges--start` and
 * `scroll-edges--end` while there is more content to that side, so the page can
 * show a shadow on that edge. The classes only change when an edge is reached,
 * so scrolling itself costs no rendering.
 */
@Directive({
  selector: '[technicalScrollEdges]',
  host: {
    '(scroll)': 'update()',
    '[class.scroll-edges--start]': 'start()',
    '[class.scroll-edges--end]': 'end()',
  },
})
export class ScrollEdges {
  private readonly element: HTMLElement = inject(ElementRef).nativeElement;
  protected readonly start = signal(false);
  protected readonly end = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      // the container or its table changes size with the window or the data
      const observer = new ResizeObserver(() => this.update());
      observer.observe(this.element);
      const content = this.element.firstElementChild;
      if (content) observer.observe(content);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected update(): void {
    const { scrollLeft, scrollWidth, clientWidth } = this.element;
    // scrollLeft is negative in right-to-left; 1px for subpixel rounding
    const scrolled = Math.abs(scrollLeft);
    this.start.set(scrolled > 1);
    this.end.set(scrolled < scrollWidth - clientWidth - 1);
  }
}
