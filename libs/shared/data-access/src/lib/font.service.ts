import { DOCUMENT, effect, inject, Service, signal } from '@angular/core';
import { DEFAULT_FONT, FONTS, FontId, isFontId } from './fonts';

const FONT_KEY = 'cv-font';

/**
 * The active font theme as a signal. Keeps `data-font` on <html> in sync and
 * remembers the choice for the next visit (the inline script in the app's
 * index.html applies it before the first paint).
 */
@Service()
export class FontService {
  private readonly document = inject(DOCUMENT);
  private readonly window = this.document.defaultView;

  readonly fonts = FONTS;

  private readonly _font = signal<FontId>(this.savedFont());
  readonly font = this._font.asReadonly();

  constructor() {
    effect(() => {
      this.document.documentElement.dataset['font'] = this.font();
    });
  }

  changeFont(id: FontId): void {
    this._font.set(id);
    try {
      this.window?.localStorage.setItem(FONT_KEY, id);
    } catch {
      // storage unavailable (private mode, blocked): the choice lasts this visit
    }
  }

  /** Back to the default font, and forgets the choice */
  resetFont(): void {
    this._font.set(DEFAULT_FONT);
    try {
      this.window?.localStorage.removeItem(FONT_KEY);
    } catch {
      // storage unavailable: nothing was saved
    }
  }

  private savedFont(): FontId {
    let saved: string | null = null;
    try {
      saved = this.window?.localStorage.getItem(FONT_KEY) ?? null;
    } catch {
      // storage unavailable: start from the default
    }
    return saved && isFontId(saved) ? saved : DEFAULT_FONT;
  }
}
