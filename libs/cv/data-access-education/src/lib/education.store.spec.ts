import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { getState } from '@ngrx/signals';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  GRAPHQL_ENDPOINT,
  inBrowserGraphqlInterceptor,
} from '@cv/shared-data-access';
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

  it('keeps the loaded data as state, so the Redux DevTools show it', async () => {
    // Arrange
    const store = TestBed.inject(EducationStore);

    // Act
    await TestBed.inject(ApplicationRef).whenStable();

    // Assert
    expect(getState(store)).toEqual({
      educations: store.educations(),
      certificates: store.certificates(),
      additionalLearnings: store.additionalLearnings(),
      trainings: store.trainings(),
      isLoading: false,
    });
  });
  describe('against a server', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting()],
      });
    });

    it('has empty lists while loading', () => {
      // Arrange
      const store = TestBed.inject(EducationStore);

      // Act
      TestBed.tick();

      // Assert
      expect(store.isLoading()).toBe(true);
      expect(store.educations()).toEqual([]);
      expect(store.certificates()).toEqual([]);
      expect(store.additionalLearnings()).toEqual([]);
      expect(store.trainings()).toEqual([]);
      expect(store.error()).toBeUndefined();
    });

    it('reports an error when the api fails, with empty lists', async () => {
      // Arrange
      const store = TestBed.inject(EducationStore);
      TestBed.tick();

      // Act
      for (const request of TestBed.inject(HttpTestingController).match(
        GRAPHQL_ENDPOINT
      )) {
        request.flush('', { status: 500, statusText: 'Server Error' });
      }
      await TestBed.inject(ApplicationRef).whenStable();

      // Assert
      expect(store.isLoading()).toBe(false);
      expect(store.error()).toBeDefined();
      expect(store.educations()).toEqual([]);
      expect(store.certificates()).toEqual([]);
      expect(store.additionalLearnings()).toEqual([]);
      expect(store.trainings()).toEqual([]);
    });
  });
});
