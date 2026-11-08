import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    const root = document.documentElement;
    delete root.dataset['theme'];
    delete root.dataset['colorScheme'];
  });

  function start() {
    const service = TestBed.inject(ThemeService);
    TestBed.tick();
    return { service, root: TestBed.inject(DOCUMENT).documentElement };
  }

  it('offers the custom themes, starting with gold', () => {
    // Arrange
    const root = TestBed.inject(DOCUMENT).documentElement;

    // Act
    const { service } = start();

    // Assert
    expect(service.themes.map((theme) => theme.id)).toEqual([
      'peach',
      'tangerine',
      'honey',
      'kiwi',
      'grape',
      'blackberry',
      'water',
      'earth',
      'fire',
      'wind',
      'gold',
      'silver',
      'bronze',
    ]);
    expect(root.dataset['theme']).toBe('gold');
  });

  it('switches the theme on <html> and remembers it', () => {
    // Arrange
    const { service, root } = start();

    // Act
    service.changeTheme('tangerine');
    TestBed.tick();

    // Assert
    expect(root.dataset['theme']).toBe('tangerine');
    expect(Object.values({ ...localStorage })).toContain('tangerine');
  });

  it('toggles between light and dark and remembers it', () => {
    // Arrange
    const { service, root } = start();
    const initial = service.colorScheme();
    const toggled = initial === 'dark' ? 'light' : 'dark';

    // Act
    service.toggleColorScheme();
    TestBed.tick();

    // Assert
    expect(service.colorScheme()).toBe(toggled);
    expect(root.dataset['colorScheme']).toBe(toggled);
    expect(Object.values({ ...localStorage })).toContain(toggled);
  });

  it('restores a saved choice', () => {
    // Arrange
    localStorage.setItem('cv-theme', 'blackberry');
    localStorage.setItem('cv-color-scheme', 'dark');

    // Act
    const { service } = start();

    // Assert
    expect(service.theme()).toBe('blackberry');
    expect(service.colorScheme()).toBe('dark');
  });

  it('resets the theme to gold and forgets it', () => {
    // Arrange
    const { service, root } = start();
    service.changeTheme('earth');
    TestBed.tick();

    // Act
    service.resetTheme();
    TestBed.tick();

    // Assert
    expect(service.theme()).toBe('gold');
    expect(root.dataset['theme']).toBe('gold');
    expect(localStorage.getItem('cv-theme')).toBeNull();
  });

  it('stops following the system once a color scheme is chosen', () => {
    // Arrange
    const { service } = start();

    // Act
    service.changeColorScheme('dark');
    TestBed.tick();

    // Assert
    expect(service.followsSystemColorScheme()).toBe(false);
  });

  it('follows the system again after a color scheme reset', () => {
    // Arrange
    const { service, root } = start();
    service.changeColorScheme('dark');
    TestBed.tick();

    // Act
    service.resetColorScheme();
    TestBed.tick();

    // Assert
    expect(service.followsSystemColorScheme()).toBe(true);
    // without the attribute the styles follow the system
    expect(root.dataset['colorScheme']).toBeUndefined();
    expect(localStorage.getItem('cv-color-scheme')).toBeNull();
    expect(service.colorScheme()).toBe(
      matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    );
  });
});
