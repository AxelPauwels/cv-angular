import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatTabLink, MatTabNav, MatTabNavPanel } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslatePipe } from '@tolgee/ngx';
import { NavItem } from '../nav-item';
import { TranslationKey } from '@cv/shared-util-i18n';

/** Pixels a finger may move before a tap counts as a swipe */
const SWIPE_THRESHOLD = 8;

/** Pixels per wheel unit, by `WheelEvent.deltaMode`: pixels, lines, pages */
const WHEEL_UNIT_PX: readonly number[] = [1, 40, 400];

@Component({
  selector: 'ds-sub-navbar',
  imports: [
    CdkScrollable,
    RouterLink,
    RouterLinkActive,
    MatTabNav,
    MatTabLink,
    MatTabNavPanel,
    MatIcon,
    MatTooltip,
    TranslatePipe,
  ],
  templateUrl: './sub-navbar.html',
  styleUrl: './sub-navbar.scss',
  host: {
    '(document:keydown)': 'scrollFromPage($event)',
  },
})
export class SubNavbar {
  readonly items = input.required<NavItem[]>();
  readonly labelKey = input.required<TranslationKey>();
  private readonly panel = viewChild.required('panel', { read: ElementRef });
  private readonly tabs = viewChild.required(MatTabNav);
  private readonly nav = viewChild.required('nav', { read: ElementRef });
  private readonly destroyRef = inject(DestroyRef);

  /** Where the current swipe is, or undefined when there is none */
  private swipeX?: number;
  /** How far the current swipe moved, to tell a swipe from a tap */
  private swiped = 0;

  constructor() {
    // In the capture phase, before the tab's routerLink sees the click
    const skip = (event: MouseEvent) => this._skipClickAfterSwipe(event);
    afterNextRender(() => {
      const nav: HTMLElement = this.nav().nativeElement;
      nav.addEventListener('click', skip, { capture: true });
      this.destroyRef.onDestroy(() =>
        nav.removeEventListener('click', skip, { capture: true })
      );
    });
  }

  /**
   * Material moves tabs that don't fit with its arrow buttons only. A finger
   * or pen dragging sideways moves them as well (`touch-action: pan-y` in the
   * styles leaves sideways moves to us, vertical ones still scroll the page).
   * A mouse keeps selecting text and clicking as usual.
   */
  protected startSwipe(event: PointerEvent): void {
    if (event.pointerType === 'mouse') {
      return;
    }
    this.swipeX = event.clientX;
    this.swiped = 0;
  }

  protected swipe(event: PointerEvent): void {
    if (this.swipeX === undefined) {
      return;
    }
    const by = this.swipeX - event.clientX;
    this.swipeX = event.clientX;
    this.swiped += Math.abs(by);
    this._moveTabs(by);
  }

  protected endSwipe(): void {
    this.swipeX = undefined;
  }

  /** A swipe that ends on a tab is not a tap on it */
  private _skipClickAfterSwipe(event: MouseEvent): void {
    if (this.swiped > SWIPE_THRESHOLD) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.swiped = 0;
  }

  /**
   * A sideways scroll (trackpad, or Shift + mouse wheel) moves the tabs too.
   * Browsers report Shift + wheel either as a sideways scroll (`deltaX`) or as
   * a normal one with `shiftKey`, and Firefox counts in lines instead of pixels.
   */
  protected scrollSideways(event: WheelEvent): void {
    const sideways =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.shiftKey
          ? event.deltaY
          : 0;
    const pixels =
      sideways * (WHEEL_UNIT_PX[event.deltaMode] ?? WHEEL_UNIT_PX[0]);
    if (pixels && this._moveTabs(pixels)) {
      // the tabs moved: the page shouldn't scroll (or go back in history) as well
      event.preventDefault();
    }
  }

  /** Moves the tabs by `by` pixels; false when they were at their end already */
  private _moveTabs(by: number): boolean {
    const tabs = this.tabs();
    const before = tabs.scrollDistance;
    // the setter keeps it between 0 and the end, and updates the arrows
    tabs.scrollDistance = before + by;
    return tabs.scrollDistance !== before;
  }

  /**
   * The page scrolls in the panel (from md up), not in the window. With nothing
   * focused the browser would send Space, Page Up/Down, Home, End and the arrows
   * to the window, which doesn't scroll, so they scroll the panel instead.
   */
  protected scrollFromPage(event: KeyboardEvent): void {
    const panel: HTMLElement = this.panel().nativeElement;
    if (
      event.defaultPrevented ||
      event.target !== panel.ownerDocument.body ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      panel.scrollHeight <= panel.clientHeight
    ) {
      return;
    }
    const page = panel.clientHeight * 0.875;
    const line = 40;
    const by: Partial<Record<string, number>> = {
      ArrowDown: line,
      ArrowUp: -line,
      PageDown: page,
      PageUp: -page,
      ' ': event.shiftKey ? -page : page,
      Home: -panel.scrollHeight,
      End: panel.scrollHeight,
    };
    const top = by[event.key];
    if (top !== undefined) {
      event.preventDefault();
      panel.scrollBy({ top });
    }
  }
}
