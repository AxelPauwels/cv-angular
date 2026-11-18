import { TestBed } from '@angular/core/testing';
import { saveFeatureTogglesForTesting } from '@cv/shared-data-access';
import { ROUTES } from '@cv/shared-util-routing';
import {
  TECHNICAL_NAV_ITEMS,
  firstVisibleTechnicalPage,
} from './technical-nav-items';

describe('technical nav items', () => {
  beforeEach(() => localStorage.clear());

  /** Every technical page switched off except the given ones */
  function onlyOn(...on: string[]): string {
    saveFeatureTogglesForTesting(
      Object.fromEntries(
        TECHNICAL_NAV_ITEMS.map(({ toggle }) => [toggle, on.includes(toggle)])
      )
    );
    return TestBed.runInInjectionContext(() => firstVisibleTechnicalPage());
  }

  it('redirects to the first page while every page is on', () => {
    // Arrange
    const toggles = TECHNICAL_NAV_ITEMS.map(({ toggle }) => toggle);

    // Act
    const path = onlyOn(...toggles);

    // Assert
    expect(path).toBe(ROUTES.TECHNICAL.ARCHITECTURE);
  });

  it('skips the pages that are switched off', () => {
    // Arrange
    const toggle = 'technical-versions';

    // Act
    const path = onlyOn(toggle);

    // Assert
    expect(path).toBe(ROUTES.TECHNICAL.VERSIONS);
  });

  it('lists Foundations second, switched by its own toggle', () => {
    // Arrange
    const items = TECHNICAL_NAV_ITEMS;

    // Act
    const foundations = items[1];
    const path = onlyOn('technical-foundations');

    // Assert
    expect(foundations).toEqual({
      labelKey: 't.nav.foundations',
      path: ROUTES.TECHNICAL.FOUNDATIONS,
      toggle: 'technical-foundations',
    });
    expect(path).toBe(ROUTES.TECHNICAL.FOUNDATIONS);
  });

  it('falls back to the first page when every page is off', () => {
    // Arrange
    const none: string[] = [];

    // Act
    const path = onlyOn(...none);

    // Assert
    expect(path).toBe(ROUTES.TECHNICAL.ARCHITECTURE);
  });

  it('gives every page a menu label', () => {
    // Arrange
    const items = TECHNICAL_NAV_ITEMS;

    // Act
    const labels = items.map(({ labelKey }) => labelKey);

    // Assert
    expect(labels.every((key) => key.startsWith('t.nav.'))).toBe(true);
    expect(new Set(items.map(({ path }) => path)).size).toBe(items.length);
  });
});
