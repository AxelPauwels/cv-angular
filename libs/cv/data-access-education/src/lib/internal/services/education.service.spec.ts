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
    // Arrange & Act
    const educations = load((service) => service.educations());
    await stable();

    // Assert
    expect(educations.error()).toBeUndefined();
    expect(educations.value()?.length).toBeGreaterThan(0);
    for (const education of educations.value() ?? []) {
      expect(education.period.start).toBeInstanceOf(Date);
      expect(education.degree).not.toBeNull();
    }
  });

  it('loads certificates and additional learnings', async () => {
    // Arrange & Act
    const certificates = load((service) => service.certificates());
    const learnings = load((service) => service.additionalLearnings());
    await stable();

    // Assert
    expect(certificates.error()).toBeUndefined();
    expect(learnings.error()).toBeUndefined();
    expect(certificates.value()).toEqual(expect.any(Array));
    expect(learnings.value()).toEqual(expect.any(Array));
  });

  it('maps certificates with their issuer and year', async () => {
    // Arrange & Act
    const certificates = load((service) => service.certificates());
    await stable();

    // Assert
    expect(certificates.value()).toContainEqual(
      expect.objectContaining({
        name: 'Linux Essentials',
        issuer: 'Linux Professional Institute',
        year: 2016,
      })
    );
  });

  it('maps trainings without nulls for the optional fields', async () => {
    // Arrange & Act
    const trainings = load((service) => service.trainings());
    await stable();

    // Assert
    expect(trainings.error()).toBeUndefined();
    const ongoing = trainings
      .value()
      ?.find((training) => training.name === 'Modern Angular v22');
    expect(ongoing).toEqual({
      name: 'Modern Angular v22',
      provider: 'Angular Architects GDE Manfred Steyer',
      status: 'ONGOING',
    });
    for (const training of trainings.value() ?? []) {
      expect(training.provider).not.toBeNull();
      expect(training.year).not.toBeNull();
    }
  });
});
