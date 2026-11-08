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

  /** The control that started the tour, focused again when it ends */
  private opener: HTMLElement | null = null;

  start(): void {
    const focused = this.document.activeElement;
    this.opener = focused instanceof HTMLElement ? focused : null;
    this._active.set(true);
  }

  stop(): void {
    this._active.set(false);
    this.focusOpener();
    this.opener = null;
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
