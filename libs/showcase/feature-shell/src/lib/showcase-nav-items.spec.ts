import { TestBed } from '@angular/core/testing';
import { saveFeatureTogglesForTesting } from '@cv/shared-data-access';
import { ROUTES } from '@cv/shared-util-routing';
import {
  SHOWCASE_NAV_ITEMS,
  firstVisibleShowcasePage,
} from './showcase-nav-items';

describe('showcase nav items', () => {
  beforeEach(() => localStorage.clear());

  /** Every showcase page switched off except the given ones */
  function onlyOn(...on: string[]): string {
    saveFeatureTogglesForTesting(
      Object.fromEntries(
        SHOWCASE_NAV_ITEMS.map(({ toggle }) => [toggle, on.includes(toggle)])
      )
    );
    return TestBed.runInInjectionContext(() => firstVisibleShowcasePage());
  }

  it('redirects to the first page while every page is on', () => {
    // Arrange
    const toggles = SHOWCASE_NAV_ITEMS.map(({ toggle }) => toggle);

    // Act
    const path = onlyOn(...toggles);

    // Assert
    expect(path).toBe(ROUTES.SHOWCASE.MICRO_FRONTENDS);
  });

  it('skips the pages that are switched off', () => {
    // Arrange
    const toggle = 'showcase-lighthouse';

    // Act
    const path = onlyOn(toggle);

    // Assert
    expect(path).toBe(ROUTES.SHOWCASE.LIGHTHOUSE);
  });

  it('falls back to the first page when every page is off', () => {
    // Arrange
    const none: string[] = [];

    // Act
    const path = onlyOn(...none);

    // Assert
    expect(path).toBe(ROUTES.SHOWCASE.MICRO_FRONTENDS);
  });

  it('gives every page a menu label', () => {
    // Arrange
    const items = SHOWCASE_NAV_ITEMS;

    // Act
    const labels = items.map(({ labelKey }) => labelKey);

    // Assert
    expect(labels.every((key) => key.startsWith('t.nav.'))).toBe(true);
    expect(new Set(items.map(({ path }) => path)).size).toBe(items.length);
  });
});
