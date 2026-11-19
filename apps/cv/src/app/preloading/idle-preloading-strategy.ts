import { DOCUMENT, inject, Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { defer, Observable, shareReplay, switchMap } from 'rxjs';

/** Longest wait for an idle moment before preloading anyway */
export const IDLE_TIMEOUT_MS = 3000;

/**
 * Preloads every lazy route, like `PreloadAllModules`, but only once the page
 * has loaded and the browser is idle. Started right after the first
 * navigation, preloading downloaded and ran every page's code (the AI
 * assistant, the GraphQL API, tables, ...) while the first page was still
 * rendering, which delayed its Largest Contentful Paint by seconds.
 */
@Injectable({ providedIn: 'root' })
export class IdlePreloadingStrategy implements PreloadingStrategy {
  private readonly window = inject(DOCUMENT).defaultView;

  /** One wait shared by every route */
  private readonly idle$ = defer(() => this._whenIdle()).pipe(
    shareReplay({ bufferSize: 1, refCount: false })
  );

  preload(_route: Route, load: () => Observable<unknown>): Observable<unknown> {
    return this.idle$.pipe(switchMap(() => load()));
  }

  private _whenIdle(): Promise<void> {
    const window = this.window;
    if (!window) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      // Safari has no requestIdleCallback: wait the timeout there instead
      const afterLoad = () =>
        typeof window.requestIdleCallback === 'function'
          ? window.requestIdleCallback(() => resolve(), {
              timeout: IDLE_TIMEOUT_MS,
            })
          : window.setTimeout(() => resolve(), IDLE_TIMEOUT_MS);
      if (window.document.readyState === 'complete') {
        afterLoad();
      } else {
        window.addEventListener('load', afterLoad, { once: true });
      }
    });
  }
}
