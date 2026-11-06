import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { ExperienceStore } from './experience.store';

describe('ExperienceStore', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
      ],
    });
  });

  it('exposes the experiences', async () => {
    // Arrange & Act
    const store = TestBed.inject(ExperienceStore);
    await TestBed.inject(ApplicationRef).whenStable();

    // Assert
    expect(store.error()).toBeUndefined();
    expect(store.experiences().length).toBeGreaterThan(0);
  });

  it('keeps the result for the next consumer', async () => {
    // Arrange & Act
    TestBed.inject(ExperienceStore);
    await TestBed.inject(ApplicationRef).whenStable();

    // Assert
    // a page opened later gets the same store, already loaded
    expect(TestBed.inject(ExperienceStore).isLoading()).toBe(false);
  });
});
