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
    // Arrange
    const educations = load((service) => service.educations());

    // Act
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
    // Arrange
    const certificates = load((service) => service.certificates());
    const learnings = load((service) => service.additionalLearnings());

    // Act
    await stable();

    // Assert
    expect(certificates.error()).toBeUndefined();
    expect(learnings.error()).toBeUndefined();
    expect(certificates.value()).toEqual(expect.any(Array));
    expect(learnings.value()).toEqual(expect.any(Array));
  });

  it('maps certificates with their issuer and year', async () => {
    // Arrange
    const certificates = load((service) => service.certificates());

    // Act
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
    // Arrange
    const trainings = load((service) => service.trainings());

    // Act
    await stable();

    // Assert
    expect(trainings.error()).toBeUndefined();
    const recurring = trainings
      .value()
      ?.find((training) => training.name === 'NG-BE');
    expect(recurring).toEqual({ name: 'NG-BE', status: 'RECURRING' });
    for (const training of trainings.value() ?? []) {
      expect(training.provider).not.toBeNull();
      expect(training.year).not.toBeNull();
    }
  });
});
