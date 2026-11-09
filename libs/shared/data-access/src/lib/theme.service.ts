import {
  computed,
  DOCUMENT,
  effect,
  inject,
  Service,
  signal,
} from '@angular/core';
import {
  ColorScheme,
  DEFAULT_COLOR_SCHEME,
  DEFAULT_THEME,
  isThemeId,
  THEMES,
  ThemeId,
} from './themes';

const THEME_KEY = 'cv-theme';
const COLOR_SCHEME_KEY = 'cv-color-scheme';

/**
 * The active color theme and light/dark mode as signals. Keeps `data-theme` and
 * `data-color-scheme` on <html> in sync and remembers the choice for the next visit
 * (the inline script in the app's index.html applies it before the first paint).
 * Until the user picks a mode, or after a reset, the mode is light.
 */
@Service()
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly window = this.document.defaultView;

  readonly themes = THEMES;

  private readonly _theme = signal<ThemeId>(this.savedTheme());
  readonly theme = this._theme.asReadonly();

  private readonly chosenColorScheme = signal<ColorScheme | undefined>(
    this.savedColorScheme()
  );
  readonly colorScheme = computed<ColorScheme>(
    () => this.chosenColorScheme() ?? DEFAULT_COLOR_SCHEME
  );

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

  /** Back to the default theme, and forgets the choice */
  resetTheme(): void {
    this._theme.set(DEFAULT_THEME);
    this.remove(THEME_KEY);
  }

  changeColorScheme(scheme: ColorScheme): void {
    this.chosenColorScheme.set(scheme);
    this.save(COLOR_SCHEME_KEY, scheme);
  }

  /** Back to the default (light) mode, and forgets the choice */
  resetColorScheme(): void {
    this.chosenColorScheme.set(undefined);
    this.remove(COLOR_SCHEME_KEY);
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

  private load(key: string): string | null {
    try {
      return this.window?.localStorage.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  private remove(key: string): void {
    try {
      this.window?.localStorage.removeItem(key);
    } catch {
      // storage unavailable: nothing was saved
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
