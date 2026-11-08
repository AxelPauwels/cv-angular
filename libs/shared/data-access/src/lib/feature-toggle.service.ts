import {
  computed,
  DOCUMENT,
  inject,
  Service,
  Signal,
  signal,
} from '@angular/core';
import {
  defaultFeatureToggleStates,
  FEATURE_TOGGLES,
  FeatureToggleId,
  FeatureToggleStates,
  isFeatureToggleId,
  withConsistentMenuItems,
  withLinkedMenuItems,
} from './feature-toggles';

const FEATURE_TOGGLES_KEY = 'cv-feature-toggles';

/**
 * Which features are on, as signals, managed on the admin page. Only the
 * toggles that differ from their default are remembered (in this browser), so
 * a changed default reaches everyone who never touched that toggle.
 */
@Service()
export class FeatureToggleService {
  private readonly window = inject(DOCUMENT).defaultView;

  readonly toggles = FEATURE_TOGGLES;

  private readonly _states = signal<FeatureToggleStates>(this.savedStates());
  readonly states = this._states.asReadonly();

  isEnabled(id: FeatureToggleId): Signal<boolean> {
    return computed(() => this._states()[id]);
  }

  change(id: FeatureToggleId, enabled: boolean): void {
    this._states.update((states) =>
      withLinkedMenuItems({ ...states, [id]: enabled }, id)
    );
    this.save();
  }

  /** Every toggle back to its default, and forgets the choices */
  reset(): void {
    this._states.set(withConsistentMenuItems(defaultFeatureToggleStates()));
    try {
      this.window?.localStorage.removeItem(FEATURE_TOGGLES_KEY);
    } catch {
      // storage unavailable: nothing was saved
    }
  }

  /** Saved values are external input: keep only known ids with boolean values */
  private savedStates(): FeatureToggleStates {
    const states = defaultFeatureToggleStates();
    try {
      const saved: unknown = JSON.parse(
        this.window?.localStorage.getItem(FEATURE_TOGGLES_KEY) ?? 'null'
      );
      if (saved && typeof saved === 'object') {
        for (const [id, enabled] of Object.entries(saved)) {
          if (isFeatureToggleId(id) && typeof enabled === 'boolean') {
            states[id] = enabled;
          }
        }
      }
    } catch {
      // storage unavailable or corrupt: the defaults
    }
    return withConsistentMenuItems(states);
  }

  private save(): void {
    const states = this._states();
    const defaults = defaultFeatureToggleStates();
    const changed = Object.fromEntries(
      FEATURE_TOGGLES.filter(({ id }) => states[id] !== defaults[id]).map(
        ({ id }) => [id, states[id]]
      )
    );
    try {
      if (Object.keys(changed).length) {
        this.window?.localStorage.setItem(
          FEATURE_TOGGLES_KEY,
          JSON.stringify(changed)
        );
      } else {
        this.window?.localStorage.removeItem(FEATURE_TOGGLES_KEY);
      }
    } catch {
      // storage unavailable (private mode, blocked): the choice lasts this visit
    }
  }
}
