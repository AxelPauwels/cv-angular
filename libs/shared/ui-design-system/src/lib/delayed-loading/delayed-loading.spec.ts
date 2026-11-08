import {
  ApplicationRef,
  Injector,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { delayedLoading } from './delayed-loading';

describe('delayedLoading', () => {
  const loading = signal(false);

  const create = (preview = 0) =>
    runInInjectionContext(TestBed.inject(Injector), () =>
      delayedLoading(loading, { delay: 300, minDuration: 1000, preview })
    );

  const settle = (ms: number) => {
    vi.advanceTimersByTime(ms);
    TestBed.tick();
  };

  beforeEach(() => {
    vi.useFakeTimers();
    loading.set(false);
  });

  afterEach(() => vi.useRealTimers());

  it('is pending without an indicator right away', () => {
    // Arrange
    loading.set(true);

    // Act
    const state = create();

    // Assert
    expect(state.pending()).toBe(true);
    expect(state.indicator()).toBe(false);
  });

  it('shows no indicator for a fast load', () => {
    // Arrange
    loading.set(true);
    const state = create();
    settle(200);

    // Act
    loading.set(false);
    TestBed.tick();

    // Assert
    expect(state.pending()).toBe(false);
    expect(state.indicator()).toBe(false);
  });

  it('shows the indicator after the delay', () => {
    // Arrange
    loading.set(true);
    const state = create();

    // Act
    settle(300);

    // Assert
    expect(state.indicator()).toBe(true);
  });

  it('holds the indicator when the load ends before the minimum', () => {
    // Arrange
    loading.set(true);
    const state = create();
    settle(400);

    // Act
    loading.set(false);
    TestBed.tick();
    settle(899);

    // Assert
    expect(state.indicator()).toBe(true);
    expect(state.pending()).toBe(true);
  });

  it('lets go of the indicator once the minimum has passed', () => {
    // Arrange
    loading.set(true);
    const state = create();
    settle(400);
    loading.set(false);
    TestBed.tick();
    settle(899);

    // Act
    settle(1);

    // Assert
    expect(state.pending()).toBe(false);
  });

  describe('app stability', () => {
    let stable: boolean | undefined;
    let subscription: { unsubscribe(): void };
    // a signal change schedules change detection, which is a short pending task
    // of its own; let it run (well within the hold) so only ours is left
    const flushScheduler = () => vi.advanceTimersByTimeAsync(20);

    beforeEach(() => {
      subscription = TestBed.inject(ApplicationRef).isStable.subscribe(
        (value) => (stable = value)
      );
    });

    afterEach(() => subscription.unsubscribe());

    it('keeps the app unstable while content is held back, so whenStable waits for it', async () => {
      // Arrange
      loading.set(true);
      create();
      settle(300);

      // Act: the data arrives, but the indicator is held for its minimum
      loading.set(false);
      TestBed.tick();
      await flushScheduler();

      // Assert
      expect(stable).toBe(false);
    });

    it('makes the app stable again once the hold is over', async () => {
      // Arrange
      loading.set(true);
      create();
      settle(300);
      loading.set(false);
      TestBed.tick();
      await flushScheduler();

      // Act
      settle(1000);
      await flushScheduler();

      // Assert
      expect(stable).toBe(true);
    });
  });

  it('shows the preview indicator even when nothing loads', () => {
    // Arrange
    const preview = 3000;

    // Act
    const state = create(preview);

    // Assert
    expect(state.indicator()).toBe(true);
  });

  it('holds the preview indicator for the whole preview', () => {
    // Arrange
    const state = create(3000);

    // Act
    settle(2999);

    // Assert
    expect(state.indicator()).toBe(true);
  });

  it('hides the preview indicator after the preview', () => {
    // Arrange
    const state = create(3000);
    settle(2999);

    // Act
    settle(1);

    // Assert
    expect(state.indicator()).toBe(false);
  });
});
