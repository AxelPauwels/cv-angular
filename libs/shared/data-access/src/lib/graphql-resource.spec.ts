import { ApplicationRef, Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from './in-browser-graphql.interceptor';
import { graphqlResource } from './graphql-resource';

describe('graphqlResource', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
      ],
    });
  });

  function query<T>(source: string) {
    return runInInjectionContext(TestBed.inject(Injector), () =>
      graphqlResource<T>(source)
    );
  }

  it('answers queries in the browser', async () => {
    const people = query<{ people: { id: string }[] }>('{ people { id } }');
    await TestBed.inject(ApplicationRef).whenStable();
    expect(people.value()?.people.length).toBeGreaterThan(0);
  });

  it('turns GraphQL errors into a resource error', async () => {
    const broken = query('{ doesNotExist }');
    await TestBed.inject(ApplicationRef).whenStable();
    expect(broken.error()).toBeTruthy();
  });
});
