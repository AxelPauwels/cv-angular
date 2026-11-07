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
    // Arrange & Act
    const store = TestBed.inject(PersonStore);

    // Assert
    expect(store.person()).toBeUndefined();

    // Act
    await TestBed.inject(ApplicationRef).whenStable();

    // Assert
    expect(store.error()).toBeUndefined();
    expect(store.person()?.firstName).toBe('Axel');
  });

  it('keeps the result for the next consumer', async () => {
    // Arrange & Act
    TestBed.inject(PersonStore);
    await TestBed.inject(ApplicationRef).whenStable();

    // Assert
    // a page opened later gets the same store, already loaded
    expect(TestBed.inject(PersonStore).isLoading()).toBe(false);
  });
});
