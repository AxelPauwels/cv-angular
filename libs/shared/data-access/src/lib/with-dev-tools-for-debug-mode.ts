import {
  withDevtools,
  withDevToolsStub,
} from '@angular-architects/ngrx-toolkit';

/**
 * Connects a signal store to the Redux DevTools under `name`, in development
 * builds only. Production builds set `ngDevMode` to false at build time, so
 * they get the stub and `withDevtools` is left out of the bundle.
 *
 * @example signalStore(withState(...), withDevToolsForDebugMode('education'))
 */
export function withDevToolsForDebugMode(name: string) {
  return typeof ngDevMode === 'undefined' || ngDevMode
    ? withDevtools(name)
    : withDevToolsStub(name);
}
