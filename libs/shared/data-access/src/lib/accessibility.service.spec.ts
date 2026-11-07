import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AccessibilityService } from './accessibility.service';

const KEY = 'cv-accessibility';

describe('AccessibilityService', () => {
  beforeEach(() => {
    localStorage.clear();
    const root = document.documentElement;
    delete root.dataset['textSize'];
    root.removeAttribute('data-reduce-motion');
    root.removeAttribute('data-high-contrast');
    root.removeAttribute('data-wide-text-spacing');
  });

  function start() {
    const service = TestBed.inject(AccessibilityService);
    TestBed.tick();
    return { service, root: TestBed.inject(DOCUMENT).documentElement };
  }

  it('starts at the browser text size and follows the system preferences', () => {
    // Arrange & Act
    const { service, root } = start();

    // Assert
    expect(service.settings()).toEqual({
      textSize: 100,
      reduceMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: matchMedia('(prefers-contrast: more)').matches,
      wideTextSpacing: false,
    });
    expect(service.isDefault()).toBe(true);
    expect(root.dataset['textSize']).toBe('100');
    expect(root.hasAttribute('data-wide-text-spacing')).toBe(false);
  });

  it('applies a change to <html> and remembers only what changed', () => {
    // Arrange
    const { service, root } = start();
    const reduceMotion = !service.settings().reduceMotion;

    // Act
    service.change({ textSize: 125, wideTextSpacing: true, reduceMotion });
    TestBed.tick();

    // Assert
    expect(root.dataset['textSize']).toBe('125');
    expect(root.hasAttribute('data-wide-text-spacing')).toBe(true);
    expect(root.hasAttribute('data-reduce-motion')).toBe(reduceMotion);
    expect(JSON.parse(localStorage.getItem(KEY) ?? '')).toEqual({
      textSize: 125,
      wideTextSpacing: true,
      reduceMotion,
    });
    expect(service.isDefault()).toBe(false);
  });

  it('forgets a setting changed back to its default', () => {
    // Arrange
    const { service } = start();

    // Act
    service.change({ textSize: 150 });
    service.change({ textSize: 100 });

    // Assert
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(service.isDefault()).toBe(true);
  });

  it('restores the saved settings and ignores invalid ones', () => {
    // Arrange
    localStorage.setItem(
      KEY,
      JSON.stringify({
        textSize: 999,
        wideTextSpacing: true,
        highContrast: 'yes',
      })
    );

    // Act
    const { service, root } = start();

    // Assert
    expect(service.settings().textSize).toBe(100);
    expect(service.settings().wideTextSpacing).toBe(true);
    expect(service.settings().highContrast).toBe(
      matchMedia('(prefers-contrast: more)').matches
    );
    expect(root.hasAttribute('data-wide-text-spacing')).toBe(true);
  });

  it('survives stored data that is not JSON', () => {
    // Arrange
    localStorage.setItem(KEY, '{not json');

    // Act
    const { service } = start();

    // Assert
    expect(service.isDefault()).toBe(true);
  });

  it('resets everything to the defaults', () => {
    // Arrange
    const { service, root } = start();
    service.change({ textSize: 150, wideTextSpacing: true });

    // Act
    service.reset();
    TestBed.tick();

    // Assert
    expect(service.isDefault()).toBe(true);
    expect(root.dataset['textSize']).toBe('100');
    expect(localStorage.getItem(KEY)).toBeNull();
  });
});
