import { ApplicationRef, Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { SkillService } from './skill.service';

describe('SkillService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
      ],
    });
  });

  // resources need an injection context, like a component field initializer
  function load<T>(create: (service: SkillService) => T): T {
    const service = TestBed.inject(SkillService);
    return runInInjectionContext(TestBed.inject(Injector), () =>
      create(service)
    );
  }

  const stable = () => TestBed.inject(ApplicationRef).whenStable();

  it('maps skills to the frontend model', async () => {
    const skills = load((service) => service.skills());
    await stable();

    expect(skills.error()).toBeUndefined();
    expect(skills.value()?.length).toBeGreaterThan(0);
    expect(skills.value()?.[0].entries.length).toBeGreaterThan(0);
  });
});
