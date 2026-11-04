import { ApplicationRef, Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { EducationService } from './education.service';

describe('EducationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
      ],
    });
  });

  // resources need an injection context, like a component field initializer
  function load<T>(create: (service: EducationService) => T): T {
    const service = TestBed.inject(EducationService);
    return runInInjectionContext(TestBed.inject(Injector), () =>
      create(service)
    );
  }

  const stable = () => TestBed.inject(ApplicationRef).whenStable();

  it('maps educations to the frontend model', async () => {
    const educations = load((service) => service.educations());
    await stable();

    expect(educations.error()).toBeUndefined();
    expect(educations.value()?.length).toBeGreaterThan(0);
    for (const education of educations.value() ?? []) {
      expect(education.period.start).toBeInstanceOf(Date);
      expect(education.degree).not.toBeNull();
    }
  });

  it('loads certificates and additional learnings', async () => {
    const certificates = load((service) => service.certificates());
    const learnings = load((service) => service.additionalLearnings());
    await stable();

    expect(certificates.error()).toBeUndefined();
    expect(learnings.error()).toBeUndefined();
    expect(certificates.value()).toEqual(expect.any(Array));
    expect(learnings.value()).toEqual(expect.any(Array));
  });
});
