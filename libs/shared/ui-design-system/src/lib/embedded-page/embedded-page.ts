import { Component, computed, inject, input } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@tolgee/ngx';

/** Paths on this origin only: an iframe source is a trusted resource URL */
const isSameOriginPath = (src: string) =>
  src.startsWith('/') && !src.startsWith('//');

/**
 * Shows a standalone page of this site (e.g. a test report) inside the layout,
 * in an iframe so its own scripts and styles can't clash with the app's.
 * `src` and `title` (a translation key) come from route data.
 *
 * Hosting answers unknown paths with the app's index.html, so the page is
 * checked first: without that, a missing report would show the app nested
 * inside itself.
 */
@Component({
  selector: 'ds-embedded-page',
  imports: [MatButton, MatIcon, TranslatePipe],
  templateUrl: './embedded-page.html',
  styleUrl: './embedded-page.scss',
})
export class EmbeddedPage {
  readonly src = input.required<string>();
  readonly title = input('');

  private readonly sanitizer = inject(DomSanitizer);

  private readonly page = httpResource.text(() =>
    isSameOriginPath(this.src()) ? this.src() : undefined
  );

  protected readonly isLoading = computed(() => this.page.isLoading());

  protected readonly isAvailable = computed(
    () => this.page.hasValue() && !this.page.value().includes('<app-root')
  );

  protected readonly frameSrc = computed<SafeResourceUrl | undefined>(() =>
    isSameOriginPath(this.src())
      ? this.sanitizer.bypassSecurityTrustResourceUrl(this.src())
      : undefined
  );
}
