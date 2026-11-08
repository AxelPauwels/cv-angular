import {
  LOADING_DELAY_MS,
  LOADING_MIN_DURATION_MS,
  LOADING_PREVIEW_MS,
} from './loading-timing';

describe('loading timing', () => {
  it('keeps an indicator on screen longer than it waits to show it', () => {
    // Arrange
    const delay = LOADING_DELAY_MS;

    // Act
    const onScreenLonger = LOADING_MIN_DURATION_MS - delay;

    // Assert
    expect(delay).toBeGreaterThan(0);
    expect(onScreenLonger).toBeGreaterThan(0);
  });

  it('ships without the design preview', () => {
    // Arrange
    const off = 0;

    // Act
    const preview = LOADING_PREVIEW_MS;

    // Assert
    expect(preview).toBe(off);
  });
});
