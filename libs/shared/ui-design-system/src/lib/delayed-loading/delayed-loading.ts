import {
  computed,
  DestroyRef,
  effect,
  inject,
  PendingTasks,
  signal,
  Signal,
  untracked,
} from '@angular/core';

/** Loads faster than this never show a spinner */
export const SPINNER_DELAY_MS = 300;

/** Once the spinner shows, it stays at least this long so it never flickers */
export const SPINNER_MIN_DURATION_MS = 1000;

/** Holds the spinner on screen this long on every visit, to preview its design; 0 turns it off */
export const SPINNER_PREVIEW_MS = 0;

export interface DelayedLoadingOptions {
  delay?: number;
  minDuration?: number;
  preview?: number;
}

export interface DelayedLoading {
  /** True while loading or while the spinner is held on screen: render no content yet */
  readonly pending: Signal<boolean>;
  /** True when the spinner should be rendered */
  readonly spinner: Signal<boolean>;
}

type Phase = 'done' | 'waiting' | 'spinner';

/**
 * Turns a raw loading flag into a flicker-free loading state: nothing for the
 * first `delay` ms, then a spinner that stays at least `minDuration` ms.
 * Call it in an injection context (a field initializer).
 *
 * While content is held back (`pending`), the app counts as not stable yet, so
 * `whenStable()` (tests, prerendering) waits until the content renders, also when
 * the data has arrived but the spinner is still held for its minimum.
 */
export function delayedLoading(
  loading: () => boolean,
  {
    delay = SPINNER_DELAY_MS,
    minDuration = SPINNER_MIN_DURATION_MS,
    preview = SPINNER_PREVIEW_MS,
  }: DelayedLoadingOptions = {}
): DelayedLoading {
  const pendingTasks = inject(PendingTasks);
  const phase = signal<Phase>('done');
  let releaseTask: (() => void) | undefined;

  const setPhase = (next: Phase) => {
    phase.set(next);
    if (next === 'done') {
      releaseTask?.();
      releaseTask = undefined;
    } else {
      releaseTask ??= pendingTasks.add();
    }
  };
  if (preview > 0) setPhase('spinner');

  let holdUntil = preview > 0 ? Date.now() + preview : 0;
  let waitingSince = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const later = (ms: number) => {
    timer = setTimeout(() => update(untracked(loading)), ms);
  };

  const update = (isLoading: boolean) => {
    clearTimeout(timer);
    const now = Date.now();
    const current = phase();

    if (current === 'spinner') {
      if (!isLoading) {
        const remaining = holdUntil - now;
        if (remaining > 0) {
          later(remaining);
        } else {
          setPhase('done');
        }
      }
    } else if (isLoading) {
      if (current === 'done') {
        setPhase('waiting');
        waitingSince = now;
      }
      const remaining = waitingSince + delay - now;
      if (remaining > 0) {
        later(remaining);
      } else {
        setPhase('spinner');
        holdUntil = now + minDuration;
      }
    } else {
      setPhase('done');
    }
  };

  // set the right state before the first render, then follow the flag
  update(untracked(loading));
  effect(() => {
    const isLoading = loading();
    untracked(() => update(isLoading));
  });
  inject(DestroyRef).onDestroy(() => {
    clearTimeout(timer);
    releaseTask?.();
  });

  return {
    pending: computed(() => phase() !== 'done'),
    spinner: computed(() => phase() === 'spinner'),
  };
}
