import {
  LOADING_DELAY_MS,
  LOADING_MIN_DURATION_MS,
  LOADING_PREVIEW_MS,
} from './loading-timing';

describe('loading timing', () => {
  it('keeps an indicator on screen longer than it waits to show it', () => {
    // Assert
    expect(LOADING_DELAY_MS).toBeGreaterThan(0);
    expect(LOADING_MIN_DURATION_MS).toBeGreaterThan(LOADING_DELAY_MS);
  });

  it('ships without the design preview', () => {
    // Assert
    expect(LOADING_PREVIEW_MS).toBe(0);
  });
});
