import {
  afterNextRender,
  Component,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@tolgee/ngx';
import { NavTranslationKey } from '@cv/shared-util-i18n';

/**
 * A floating button at the bottom right that scrolls the page back to the top,
 * for phones (< md; wider screens scroll inside the shell, not the window).
 * It fades in once the page is scrolled down `threshold` screen heights, and
 * out again near the top. A hidden button is out of the tab order.
 */
@Component({
  selector: 'ds-back-to-top',
  imports: [MatMiniFabButton, MatIcon, TranslatePipe],
  templateUrl: './back-to-top.html',
  styleUrl: './back-to-top.scss',
})
export class BackToTop {
  /** How far down (in screen heights) the page must be scrolled to show it */
  readonly threshold = input(0.5);
  readonly labelKey = input<NavTranslationKey>('t.nav.back-to-top');
  /**
   * Gets the focus after the jump when the button had it (it fades out, so the
   * focus would get lost); needs `tabindex="-1"` when not focusable itself
   */
  readonly focusTarget = input<HTMLElement>();

  protected readonly visible = signal(false);
  private readonly document = inject(DOCUMENT);
  // the element, not the MatMiniFabButton component on it
  private readonly button = viewChild.required('button', {
    read: ElementRef<HTMLElement>,
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const view = this.document.defaultView;
      if (!view) {
        return;
      }
      // a passive listener outside the template: the signal only schedules
      // change detection when the button actually shows or hides
      const update = () =>
        this.visible.set(view.scrollY > view.innerHeight * this.threshold());
      update();
      view.addEventListener('scroll', update, { passive: true });
      view.addEventListener('resize', update, { passive: true });
      destroyRef.onDestroy(() => {
        view.removeEventListener('scroll', update);
        view.removeEventListener('resize', update);
      });
    });
  }

  protected scrollToTop(): void {
    const view = this.document.defaultView;
    const hadFocus =
      this.document.activeElement === this.button().nativeElement;
    view?.scrollTo({
      top: 0,
      behavior: this.reduceMotion() ? 'auto' : 'smooth',
    });
    if (hadFocus) {
      this.focusTarget()?.focus({ preventScroll: true });
    }
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
