import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { PersonStore } from './person.store';

describe('PersonStore', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
      ],
    });
  });

  it('exposes the person', async () => {
    const store = TestBed.inject(PersonStore);
    expect(store.person()).toBeUndefined();
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.error()).toBeUndefined();
    expect(store.person()?.firstName).toBe('Axel');
  });

  it('keeps the result for the next consumer', async () => {
    TestBed.inject(PersonStore);
    await TestBed.inject(ApplicationRef).whenStable();

    // a page opened later gets the same store, already loaded
    expect(TestBed.inject(PersonStore).isLoading()).toBe(false);
  });
});
