import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  FEDERATION_MANIFEST_URL,
  inBrowserGraphqlInterceptor,
} from '@cv/shared-data-access';
import { ServiceStatusStore } from './service-status.store';
import { ServiceStatusService } from './internal/services/service-status.service';
import type {
  ExternalService,
  ServiceCheckResult,
} from './types/service-status.types';

describe('ServiceStatusStore', () => {
  let check: ReturnType<
    typeof vi.fn<(service: ExternalService) => Promise<ServiceCheckResult>>
  >;

  beforeEach(() => {
    check = vi.fn(async (service: ExternalService) =>
      service.id === 'api:web3forms'
        ? { health: 'down' as const, issue: 'unreachable' as const }
        : { health: 'up' as const, responseTimeMs: 10 }
    );
    vi.spyOn(ServiceStatusService.prototype, 'check').mockImplementation(check);
    TestBed.configureTestingModule({
      providers: [
        ServiceStatusStore,
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
        // no manifest in the test: the remotes are simply missing
        {
          provide: FEDERATION_MANIFEST_URL,
          useValue: 'data:application/json,{}',
        },
      ],
    });
  });

  async function settle(): Promise<void> {
    await TestBed.inject(ApplicationRef).whenStable();
    await vi.waitFor(() =>
      expect(TestBed.inject(ServiceStatusStore).isChecking()).toBe(false)
    );
  }

  it('checks the APIs and the profile links from the API', async () => {
    // Arrange
    const store = TestBed.inject(ServiceStatusStore);

    // Act
    await settle();

    // Assert
    const ids = store.statuses().map(({ id }) => id);
    expect(ids).toContain('api:firebase-ai');
    expect(ids).toContain('link:linkedin');
    expect(ids).toContain('link:github');
    expect(
      store.statuses().find(({ id }) => id === 'api:web3forms')?.health
    ).toBe('down');
    expect(store.counts().down).toBe(1);
    expect(store.checkedAt()).toBeTypeOf('number');
  });

  it('checks each service once, and every service again on recheck', async () => {
    // Arrange
    const store = TestBed.inject(ServiceStatusStore);
    await settle();
    const firstRound = check.mock.calls.length;

    // Act
    store.recheck();
    const checkingDuringRecheck = store.isChecking();
    await settle();

    // Assert
    expect(firstRound).toBe(store.services().length);
    expect(checkingDuringRecheck).toBe(true);
    expect(check.mock.calls.length).toBe(firstRound * 2);
  });
});
