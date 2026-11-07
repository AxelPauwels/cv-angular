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

  it('shows no indicator for a fast load', () => {
    // Arrange & Act
    loading.set(true);
    const state = create();

    // Assert
    expect(state.pending()).toBe(true);
    expect(state.indicator()).toBe(false);

    // Act
    settle(200);
    loading.set(false);
    TestBed.tick();

    // Assert
    expect(state.pending()).toBe(false);
    expect(state.indicator()).toBe(false);
  });

  it('shows the indicator after the delay and holds it for the minimum', () => {
    // Arrange & Act
    loading.set(true);
    const state = create();
    settle(300);

    // Assert
    expect(state.indicator()).toBe(true);

    // Act
    settle(100);
    loading.set(false);
    TestBed.tick();

    // Assert
    expect(state.indicator()).toBe(true);

    // Act
    settle(899);

    // Assert
    expect(state.pending()).toBe(true);

    // Act
    settle(1);

    // Assert
    expect(state.pending()).toBe(false);
  });

  it('keeps the app unstable while content is held back, so whenStable waits for it', async () => {
    // Arrange
    let stable: boolean | undefined;
    const subscription = TestBed.inject(ApplicationRef).isStable.subscribe(
      (value) => (stable = value)
    );
    // a signal change schedules change detection, which is a short pending task
    // of its own; let it run (well within the hold) so only ours is left
    const flushScheduler = () => vi.advanceTimersByTimeAsync(20);
    loading.set(true);
    create();
    settle(300);

    // Act: the data arrives, but the indicator is held for its minimum
    loading.set(false);
    TestBed.tick();
    await flushScheduler();

    // Assert
    expect(stable).toBe(false);

    // Act
    settle(1000);
    await flushScheduler();

    // Assert
    expect(stable).toBe(true);
    subscription.unsubscribe();
  });

  it('holds the preview indicator even when nothing loads', () => {
    // Arrange & Act
    const state = create(3000);

    // Assert
    expect(state.indicator()).toBe(true);

    // Act
    settle(2999);

    // Assert
    expect(state.indicator()).toBe(true);

    // Act
    settle(1);

    // Assert
    expect(state.indicator()).toBe(false);
  });
});
