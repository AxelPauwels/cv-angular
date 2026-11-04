import { ApplicationRef, Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { ExperienceService } from './experience.service';

describe('ExperienceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
      ],
    });
  });

  // resources need an injection context, like a component field initializer
  function load<T>(create: (service: ExperienceService) => T): T {
    const service = TestBed.inject(ExperienceService);
    return runInInjectionContext(TestBed.inject(Injector), () =>
      create(service)
    );
  }

  const stable = () => TestBed.inject(ApplicationRef).whenStable();

  it('maps experiences to the frontend model', async () => {
    const experiences = load((service) => service.experiences());
    await stable();

    expect(experiences.error()).toBeUndefined();
    expect(experiences.value()?.length).toBeGreaterThan(0);
    for (const experience of experiences.value() ?? []) {
      expect(experience.period.start).toBeInstanceOf(Date);
      expect(experience.period.end).not.toBeNull();
      expect(Array.isArray(experience.jobDescriptions)).toBe(true);
    }
  });
});
