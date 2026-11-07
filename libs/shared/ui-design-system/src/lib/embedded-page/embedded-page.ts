import {
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { TranslatePipe } from '@tolgee/ngx';
import { HeadingTranslationKey } from '@cv/shared-util-i18n';
import { PageTitle } from '../page-title/page-title';
import { delayedLoading } from '../delayed-loading/delayed-loading';
import { applyAppStyles } from './embedded-styles';

/** Paths on this origin only: an iframe source is a trusted resource URL */
const isSameOriginPath = (src: string) =>
  src.startsWith('/') && !src.startsWith('//');

/**
 * Shows a standalone page of this site (e.g. a test report) inside the layout,
 * in an iframe so its own scripts and styles can't clash with the app's.
 * `src`, `title` (a heading translation key, shown as the page title) and the
 * optional `styles` (CSS for this page only, see applyAppStyles) come from route data.
 *
 * Hosting answers unknown paths with the app's index.html, so the page is
 * checked first: without that, a missing report would show the app nested
 * inside itself.
 *
 * The embedded page gets the app's font, scrollbar and a transparent background
 * (see applyAppStyles), also when the user switches font or theme while it is open.
 */
@Component({
  selector: 'ds-embedded-page',
  imports: [MatButton, MatIcon, MatProgressBar, PageTitle, TranslatePipe],
  templateUrl: './embedded-page.html',
  styleUrl: './embedded-page.scss',
})
export class EmbeddedPage {
  readonly src = input.required<string>();
  readonly title = input.required<HeadingTranslationKey>();
  /** Extra CSS for the embedded page, e.g. to hide a heading the page title repeats */
  readonly styles = input('');

  private readonly sanitizer = inject(DomSanitizer);
  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    // The font, theme and color scheme switchers set attributes on <html>: follow them into the iframe
    const observer = new MutationObserver(() => this.applyFont());
    observer.observe(this.document.documentElement, { attributes: true });
    inject(DestroyRef).onDestroy(() => observer.disconnect());
  }

  /** On every load of the iframe (also when you follow a link inside it) */
  protected applyFont(): void {
    const frame = this.host.nativeElement.querySelector('iframe');
    if (frame) {
      applyAppStyles(frame, this.document, this.styles());
    }
  }

  private readonly page = httpResource.text(() =>
    isSameOriginPath(this.src()) ? this.src() : undefined
  );

  /** Same timing as the loading spinner: no flash for a fast load, no flicker */
  protected readonly loading = delayedLoading(() => this.page.isLoading());

  protected readonly isAvailable = computed(
    () => this.page.hasValue() && !this.page.value().includes('<app-root')
  );

  protected readonly frameSrc = computed<SafeResourceUrl | undefined>(() =>
    isSameOriginPath(this.src())
      ? this.sanitizer.bypassSecurityTrustResourceUrl(this.src())
      : undefined
  );
}
