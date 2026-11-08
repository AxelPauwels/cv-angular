import {
  FEATURE_TOGGLES,
  FeatureToggleId,
  FeatureToggleStates,
} from './feature-toggles';

/**
 * For tests: saves every feature toggle as on (plus the given overrides), so a
 * `FeatureToggleService` created afterwards starts from a known state, whatever
 * the defaults in `feature-toggle-defaults.ts` are. Call it before the service
 * is first injected.
 */
export function saveFeatureTogglesForTesting(
  overrides: Partial<Record<FeatureToggleId, boolean>> = {}
): void {
  const states = {
    ...(Object.fromEntries(
      FEATURE_TOGGLES.map(({ id }) => [id, true])
    ) as FeatureToggleStates),
    ...overrides,
  };
  localStorage.setItem('cv-feature-toggles', JSON.stringify(states));
}
