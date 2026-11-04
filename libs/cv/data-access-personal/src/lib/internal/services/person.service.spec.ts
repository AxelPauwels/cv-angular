import { ApplicationRef, Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { PersonService } from './person.service';

describe('PersonService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
      ],
    });
  });

  // resources need an injection context, like a component field initializer
  function load<T>(create: (service: PersonService) => T): T {
    const service = TestBed.inject(PersonService);
    return runInInjectionContext(TestBed.inject(Injector), () =>
      create(service)
    );
  }

  const stable = () => TestBed.inject(ApplicationRef).whenStable();

  it('maps the person to the frontend model', async () => {
    const person = load((service) => service.person());
    await stable();

    expect(person.error()).toBeUndefined();
    expect(person.value()?.firstName).toBe('Axel');
    expect(person.value()?.personal.dateOfBirth).toBeInstanceOf(Date);
    expect(person.value()?.contact.website).not.toBeNull();
    expect(person.value()?.languages.length).toBeGreaterThan(0);
  });
});
