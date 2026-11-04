import { ApplicationRef, Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { ReferenceService } from './reference.service';

describe('ReferenceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
      ],
    });
  });

  // resources need an injection context, like a component field initializer
  function load<T>(create: (service: ReferenceService) => T): T {
    const service = TestBed.inject(ReferenceService);
    return runInInjectionContext(TestBed.inject(Injector), () =>
      create(service)
    );
  }

  const stable = () => TestBed.inject(ApplicationRef).whenStable();

  it('maps references to the frontend model', async () => {
    const references = load((service) => service.references());
    await stable();

    expect(references.error()).toBeUndefined();
    expect(references.value()?.length).toBeGreaterThan(0);
    for (const reference of references.value() ?? []) {
      expect(reference.workCategoryPeriod.start).toBeInstanceOf(Date);
    }
  });
});
