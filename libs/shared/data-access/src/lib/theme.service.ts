import { DOCUMENT, effect, inject, Service, signal } from '@angular/core';
import {
  ColorScheme,
  DEFAULT_THEME,
  isThemeId,
  THEMES,
  ThemeId,
} from './themes';

const THEME_KEY = 'cv-theme';
const COLOR_SCHEME_KEY = 'cv-color-scheme';

/**
 * The active color theme and light/dark mode as signals. Keeps `data-theme` and
 * `data-color-scheme` on <html> in sync and remembers the choice for the next visit.
 * Without a saved mode it starts from the system preference.
 */
@Service()
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly window = this.document.defaultView;

  readonly themes = THEMES;

  private readonly _theme = signal<ThemeId>(this.savedTheme());
  readonly theme = this._theme.asReadonly();

  private readonly _colorScheme = signal<ColorScheme>(
    this.savedColorScheme() ?? this.systemColorScheme()
  );
  readonly colorScheme = this._colorScheme.asReadonly();

  constructor() {
    effect(() => {
      const root = this.document.documentElement;
      root.dataset['theme'] = this.theme();
      root.dataset['colorScheme'] = this.colorScheme();
    });
  }

  changeTheme(id: ThemeId): void {
    this._theme.set(id);
    this.save(THEME_KEY, id);
  }

  changeColorScheme(scheme: ColorScheme): void {
    this._colorScheme.set(scheme);
    this.save(COLOR_SCHEME_KEY, scheme);
  }

  toggleColorScheme(): void {
    this.changeColorScheme(this.colorScheme() === 'dark' ? 'light' : 'dark');
  }

  private savedTheme(): ThemeId {
    const saved = this.load(THEME_KEY);
    return saved && isThemeId(saved) ? saved : DEFAULT_THEME;
  }

  private savedColorScheme(): ColorScheme | undefined {
    const saved = this.load(COLOR_SCHEME_KEY);
    return saved === 'light' || saved === 'dark' ? saved : undefined;
  }

  private systemColorScheme(): ColorScheme {
    return this.window?.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  private load(key: string): string | null {
    try {
      return this.window?.localStorage.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  private save(key: string, value: string): void {
    try {
      this.window?.localStorage.setItem(key, value);
    } catch {
      // storage unavailable (private mode, blocked): the choice lasts this visit
    }
  }
}
