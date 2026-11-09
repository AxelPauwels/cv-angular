import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inBrowserGraphqlInterceptor } from '@cv/shared-data-access';
import { EducationStore } from './education.store';

describe('EducationStore', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([inBrowserGraphqlInterceptor])),
      ],
    });
  });

  it('exposes educations, certificates, additional learnings and trainings', async () => {
    // Arrange
    const store = TestBed.inject(EducationStore);

    // Act
    await TestBed.inject(ApplicationRef).whenStable();

    // Assert
    expect(store.error()).toBeUndefined();
    expect(store.educations().length).toBeGreaterThan(0);
    expect(store.certificates()).toEqual(expect.any(Array));
    expect(store.additionalLearnings()).toEqual(expect.any(Array));
    expect(store.trainings().length).toBeGreaterThan(0);
  });

  it('keeps the result for the next consumer', async () => {
    // Arrange
    TestBed.inject(EducationStore);

    // Act
    await TestBed.inject(ApplicationRef).whenStable();

    // Assert
    // a page opened later gets the same store, already loaded
    expect(TestBed.inject(EducationStore).isLoading()).toBe(false);
  });

  it('loads again on reload, keeping the data meanwhile', async () => {
    // Arrange
    const store = TestBed.inject(EducationStore);
    await TestBed.inject(ApplicationRef).whenStable();

    // Act
    store.reload();
    const loadingDuringReload = store.isLoading();
    await TestBed.inject(ApplicationRef).whenStable();

    // Assert
    expect(loadingDuringReload).toBe(true);
    expect(store.isLoading()).toBe(false);
    expect(store.educations().length).toBeGreaterThan(0);
  });
});
