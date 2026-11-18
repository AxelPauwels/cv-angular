import { computed, effect, inject, untracked } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { withDevToolsForDebugMode } from '@cv/shared-data-access';
import { ServiceStatusService } from './internal/services/service-status.service';
import { API_SERVICES } from './internal/services/service-sources';
import type {
  ExternalService,
  ServiceCheckResult,
  ServiceHealthCounts,
  ServiceStatus,
} from './types/service-status.types';

interface ServiceStatusState {
  /** The result of each service's last check, by id */
  results: Readonly<Record<string, ServiceCheckResult>>;
  /** When the last check finished (epoch ms) */
  checkedAt: number | undefined;
}

const CHECKING: ServiceCheckResult = { health: 'checking' };

/**
 * Whether each external service the app depends on can be reached right now:
 * micro-frontends, CDNs, APIs and the CV's profile links. Checks them as soon
 * as they are known and again on `recheck()`.
 *
 * Not provided in root: provide it on the page, so every visit checks afresh
 * and nothing is checked while the page is closed.
 */
export const ServiceStatusStore = signalStore(
  withState<ServiceStatusState>({ results: {}, checkedAt: undefined }),
  withProps(() => {
    const service = inject(ServiceStatusService);
    return {
      _service: service,
      _remotes: service.remotes(),
      _links: service.links(),
      _page: service.page(),
    };
  }),
  withComputed(({ _remotes, _links, _page, results }) => {
    const services = computed((): ExternalService[] => [
      ...(_remotes.hasValue() ? _remotes.value() : []),
      ..._page,
      ...API_SERVICES,
      ...(_links.hasValue() ? _links.value() : []),
    ]);
    const statuses = computed((): ServiceStatus[] =>
      services().map((service) => ({
        ...service,
        ...(results()[service.id] ?? CHECKING),
      }))
    );
    const counts = computed((): ServiceHealthCounts => {
      const counts = { checking: 0, up: 0, degraded: 0, down: 0 };
      for (const { health } of statuses()) {
        counts[health]++;
      }
      return counts;
    });
    const isLoadingSources = computed(
      () => _remotes.isLoading() || _links.isLoading()
    );
    return {
      services,
      statuses,
      counts,
      isChecking: computed(() => isLoadingSources() || counts().checking > 0),
      /** The profile links couldn't be loaded from the API, so they're missing */
      linksError: computed(() => _links.error()),
    };
  }),
  withMethods((store) => {
    // a recheck makes the answers of the check before it stale
    let run = 0;

    const check = async (services: readonly ExternalService[]) => {
      const current = run;
      patchState(store, ({ results }) => ({
        results: {
          ...results,
          ...Object.fromEntries(services.map(({ id }) => [id, CHECKING])),
        },
      }));
      await Promise.all(
        services.map(async (service) => {
          const result = await store._service.check(service);
          if (current === run) {
            patchState(store, ({ results }) => ({
              results: { ...results, [service.id]: result },
            }));
          }
        })
      );
      if (current === run && !store.isChecking()) {
        patchState(store, { checkedAt: Date.now() });
      }
    };

    return {
      /** Checks the services that have not been checked yet */
      _checkNew(services: readonly ExternalService[]): void {
        const known = store.results();
        const added = services.filter(({ id }) => !(id in known));
        if (added.length) {
          void check(added);
        }
      },
      /** Checks every service again */
      recheck(): void {
        run++;
        void check(store.services());
      },
    };
  }),
  withHooks({
    onInit(store) {
      // the sources load one by one: check each service as soon as it's known
      effect(() => {
        const services = store.services();
        untracked(() => store._checkNew(services));
      });
    },
  }),
  withDevToolsForDebugMode('service-status')
);
