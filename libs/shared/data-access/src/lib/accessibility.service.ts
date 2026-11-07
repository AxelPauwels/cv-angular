import {
  computed,
  DOCUMENT,
  effect,
  inject,
  Service,
  signal,
} from '@angular/core';
import { AccessibilitySettings, isTextSize, TEXT_SIZES } from './accessibility';

const ACCESSIBILITY_KEY = 'cv-accessibility';

/**
 * The reader's accessibility settings as a signal. Keeps `data-text-size`,
 * `data-reduce-motion`, `data-high-contrast` and `data-wide-text-spacing` on <html>
 * in sync. Only settings the reader changed are remembered, so the others keep
 * following the system preferences (reduced motion, more contrast).
 */
@Service()
export class AccessibilityService {
  private readonly document = inject(DOCUMENT);
  private readonly window = this.document.defaultView;

  readonly textSizes = TEXT_SIZES;

  private readonly defaults: AccessibilitySettings = {
    textSize: 100,
    reduceMotion: this.matches('(prefers-reduced-motion: reduce)'),
    highContrast: this.matches('(prefers-contrast: more)'),
    wideTextSpacing: false,
  };

  private readonly changes = signal<Partial<AccessibilitySettings>>(
    this.savedChanges()
  );

  readonly settings = computed<AccessibilitySettings>(() => ({
    ...this.defaults,
    ...this.changes(),
  }));

  readonly isDefault = computed(() => Object.keys(this.changes()).length === 0);

  constructor() {
    effect(() => {
      const { textSize, reduceMotion, highContrast, wideTextSpacing } =
        this.settings();
      const root = this.document.documentElement;
      root.dataset['textSize'] = String(textSize);
      root.toggleAttribute('data-reduce-motion', reduceMotion);
      root.toggleAttribute('data-high-contrast', highContrast);
      root.toggleAttribute('data-wide-text-spacing', wideTextSpacing);
    });
  }

  change(settings: Partial<AccessibilitySettings>): void {
    const changes = { ...this.changes(), ...this.valid(settings) };
    // a setting changed back to its default follows the system again
    for (const key of Object.keys(changes) as (keyof AccessibilitySettings)[]) {
      if (changes[key] === this.defaults[key]) {
        delete changes[key];
      }
    }
    this.changes.set(changes);
    this.save(changes);
  }

  reset(): void {
    this.changes.set({});
    this.save({});
  }

  private savedChanges(): Partial<AccessibilitySettings> {
    try {
      const saved = this.window?.localStorage.getItem(ACCESSIBILITY_KEY);
      return saved ? this.valid(JSON.parse(saved)) : {};
    } catch {
      // storage unavailable or not JSON: start from the defaults
      return {};
    }
  }

  /** Keeps only known settings with a valid value (stored data is external input) */
  private valid(input: unknown): Partial<AccessibilitySettings> {
    if (typeof input !== 'object' || input === null) {
      return {};
    }
    const settings = input as Record<string, unknown>;
    const valid: Partial<AccessibilitySettings> = {};
    if (isTextSize(settings['textSize'])) {
      valid.textSize = settings['textSize'];
    }
    for (const key of [
      'reduceMotion',
      'highContrast',
      'wideTextSpacing',
    ] as const) {
      if (typeof settings[key] === 'boolean') {
        valid[key] = settings[key];
      }
    }
    return valid;
  }

  private save(changes: Partial<AccessibilitySettings>): void {
    try {
      if (Object.keys(changes).length === 0) {
        this.window?.localStorage.removeItem(ACCESSIBILITY_KEY);
      } else {
        this.window?.localStorage.setItem(
          ACCESSIBILITY_KEY,
          JSON.stringify(changes)
        );
      }
    } catch {
      // storage unavailable (private mode, blocked): the choice lasts this visit
    }
  }

  private matches(query: string): boolean {
    return this.window?.matchMedia?.(query).matches ?? false;
  }
}
