import { ApplicationRef, Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
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

  // shared code can't use a domain's generated documents: type a plain string instead
  function query<T>(source: string) {
    const document = source as DocumentTypeDecoration<T, Record<string, never>>;
    return runInInjectionContext(TestBed.inject(Injector), () =>
      graphqlResource(document)
    );
  }

  it('answers queries in the browser', async () => {
    // Arrange & Act
    const person = query<{ person: { firstName: string } }>(
      '{ person { firstName } }'
    );
    await TestBed.inject(ApplicationRef).whenStable();

    // Assert
    expect(person.value()?.person.firstName).toBeTruthy();
  });

  it('maps the result to the frontend model', async () => {
    // Arrange & Act
    const document = '{ person { firstName } }' as DocumentTypeDecoration<
      { person: { firstName: string } },
      Record<string, never>
    >;
    const name = runInInjectionContext(TestBed.inject(Injector), () =>
      graphqlResource(document, { map: ({ person }) => person.firstName })
    );
    await TestBed.inject(ApplicationRef).whenStable();

    // Assert
    expect(name.value()).toEqual(expect.any(String));
  });

  it('turns GraphQL errors into a resource error', async () => {
    // Arrange & Act
    const broken = query('{ doesNotExist }');
    await TestBed.inject(ApplicationRef).whenStable();

    // Assert
    expect(broken.error()).toBeTruthy();
  });
});
