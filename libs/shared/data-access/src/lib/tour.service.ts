import { DOCUMENT, inject, Service, signal } from '@angular/core';

/**
 * Whether the guided tour is running. Deliberately tiny: the app shell defers
 * the tour itself (`@defer (when active())`), so nothing of it loads until a
 * visitor starts it.
 */
@Service()
export class TourService {
  private readonly document = inject(DOCUMENT);

  private readonly _active = signal(false);
  readonly active = this._active.asReadonly();

  /**
   * Whether the tour wants the hamburger menu open (phones only), for the
   * steps that point at the domains inside it. Notifies on every request, also
   * an unchanged one: a step's navigation closes the menu, so the next step
   * opens it again.
   */
  private readonly _menuOpen = signal(false, { equal: () => false });
  readonly menuOpen = this._menuOpen.asReadonly();

  /** The control that started the tour, focused again when it ends */
  private opener: HTMLElement | null = null;

  start(): void {
    const focused = this.document.activeElement;
    this.opener = focused instanceof HTMLElement ? focused : null;
    this._active.set(true);
  }

  stop(): void {
    this._active.set(false);
    this._menuOpen.set(false);
    this.focusOpener();
    this.opener = null;
  }

  /** Open (or close) the hamburger menu for the current step */
  showMenu(open: boolean): void {
    this._menuOpen.set(open);
  }

  /**
   * The tour navigates, so the opener may have been re-rendered: then focus
   * its replacement, found by the same `data-tour` marker
   */
  private focusOpener(): void {
    const marker = this.opener?.dataset['tour'];
    const opener = this.opener?.isConnected
      ? this.opener
      : marker
        ? this.document.querySelector<HTMLElement>(
            `[data-tour="${CSS.escape(marker)}"]`
          )
        : null;
    opener?.focus();
  }
}
