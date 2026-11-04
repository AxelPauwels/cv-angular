import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { ReferenceStore } from './reference.store';

describe('ReferenceStore', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
      ],
    });
  });

  it('exposes the references', async () => {
    const store = TestBed.inject(ReferenceStore);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.error()).toBeUndefined();
    expect(store.references().length).toBeGreaterThan(0);
  });

  it('keeps the result for the next consumer', async () => {
    TestBed.inject(ReferenceStore);
    await TestBed.inject(ApplicationRef).whenStable();

    // a page opened later gets the same store, already loaded
    expect(TestBed.inject(ReferenceStore).isLoading()).toBe(false);
  });
});
