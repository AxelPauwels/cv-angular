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
import {
  LOADING_DELAY_MS,
  LOADING_MIN_DURATION_MS,
  LOADING_PREVIEW_MS,
} from '@cv/shared-util-loading';

export interface DelayedLoadingOptions {
  delay?: number;
  minDuration?: number;
  preview?: number;
}

export interface DelayedLoading {
  /** True while loading or while the indicator is held on screen: render no content yet */
  readonly pending: Signal<boolean>;
  /** True when the loading indicator (spinner, progress bar) should be rendered */
  readonly indicator: Signal<boolean>;
}

type Phase = 'done' | 'waiting' | 'indicator';

/**
 * Turns a raw loading flag into a flicker-free loading state: nothing for the
 * first `delay` ms, then an indicator (spinner, progress bar) that stays at least
 * `minDuration` ms. The timing defaults come from `@cv/shared-util-loading`.
 * Call it in an injection context (a field initializer).
 *
 * While content is held back (`pending`), the app counts as not stable yet, so
 * `whenStable()` (tests, prerendering) waits until the content renders, also when
 * the data has arrived but the indicator is still held for its minimum.
 */
export function delayedLoading(
  loading: () => boolean,
  {
    delay = LOADING_DELAY_MS,
    minDuration = LOADING_MIN_DURATION_MS,
    preview = LOADING_PREVIEW_MS,
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
  if (preview > 0) setPhase('indicator');

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

    if (current === 'indicator') {
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
        setPhase('indicator');
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
    indicator: computed(() => phase() === 'indicator'),
  };
}
