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

  it('offers 3 Material and 11 custom themes, starting with violet', () => {
    const { service, root } = start();

    expect(service.themes.map((theme) => theme.id)).toEqual([
      'violet',
      'azure',
      'rose',
      'copper',
      'ocean',
      'teal',
      'sage',
      'forest',
      'gold',
      'crimson',
      'plum',
      'lavender',
      'slate',
      'sand',
    ]);
    expect(root.dataset['theme']).toBe('violet');
  });

  it('switches the theme on <html> and remembers it', () => {
    const { service, root } = start();

    service.changeTheme('copper');
    TestBed.tick();

    expect(root.dataset['theme']).toBe('copper');
    expect(Object.values({ ...localStorage })).toContain('copper');
  });

  it('toggles between light and dark and remembers it', () => {
    const { service, root } = start();
    const initial = service.colorScheme();
    const toggled = initial === 'dark' ? 'light' : 'dark';

    service.toggleColorScheme();
    TestBed.tick();

    expect(service.colorScheme()).toBe(toggled);
    expect(root.dataset['colorScheme']).toBe(toggled);
    expect(Object.values({ ...localStorage })).toContain(toggled);
  });

  it('restores a saved choice', () => {
    localStorage.setItem('cv-theme', 'rose');
    localStorage.setItem('cv-color-scheme', 'dark');

    const { service } = start();

    expect(service.theme()).toBe('rose');
    expect(service.colorScheme()).toBe('dark');
  });
});
