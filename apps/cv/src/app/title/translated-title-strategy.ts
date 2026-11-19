import { DestroyRef, inject, Injectable } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslateService } from '@tolgee/ngx';
import { Subscription } from 'rxjs';

/** Some menu labels are lowercase and capitalized by CSS; a tab title isn't styled */
const capitalize = (text: string) =>
  text.charAt(0).toLocaleUpperCase() + text.slice(1);

/** Every tab title ends with the name, so the site is recognisable in tabs and results */
export const SITE_NAME = 'Axel Pauwels';

/**
 * Gives every page its own document title (WCAG 2.4.2, and what search results
 * and browser tabs show): a route's `title` is a translation key, usually its
 * menu label (`t.nav.*`), shown as "Skills · Axel Pauwels" and translated
 * again when the visitor switches language.
 *
 * The app only swaps the page content on navigation, so screen readers would not
 * notice a new page: after every navigation but the first, the new title is
 * announced (politely, without moving focus away from the menu).
 */
@Injectable()
export class TranslatedTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly translate = inject(TranslateService);
  private readonly announcer = inject(LiveAnnouncer);
  private subscription?: Subscription;
  private navigations = 0;

  constructor() {
    super();
    inject(DestroyRef).onDestroy(() => this.subscription?.unsubscribe());
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const key = this.buildTitle(snapshot);
    const announce = this.navigations++ > 0;
    this.subscription?.unsubscribe();
    if (!key) {
      this._show(SITE_NAME, announce);
      return;
    }
    let first = true;
    // emits again when the language changes; only a navigation is announced
    this.subscription = this.translate.translate(key).subscribe((page) => {
      this._show(`${capitalize(page)} · ${SITE_NAME}`, announce && first);
      first = false;
    });
  }

  private _show(text: string, announce: boolean): void {
    this.title.setTitle(text);
    if (announce) {
      void this.announcer.announce(text, 'polite');
    }
  }
}
