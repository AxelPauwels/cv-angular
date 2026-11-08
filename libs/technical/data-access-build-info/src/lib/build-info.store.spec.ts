import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ArchitectureStore, VersionStore } from './build-info.store';

describe('build info stores', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  const settle = () => TestBed.inject(ApplicationRef).whenStable();

  it('loads the installed versions', async () => {
    // Arrange
    const store = TestBed.inject(VersionStore);

    // Act
    TestBed.tick();
    TestBed.inject(HttpTestingController)
      .expectOne('/build-info/versions.json')
      .flush({
        packages: [
          {
            category: 'Framework',
            name: '@angular/core',
            label: 'Angular',
            version: '22.2.4',
          },
        ],
      });
    await settle();

    // Assert
    expect(store.packages().map((entry) => entry.label)).toEqual(['Angular']);
    expect(store.error()).toBeUndefined();
  });

  it('loads the projects and rules', async () => {
    // Arrange
    const store = TestBed.inject(ArchitectureStore);

    // Act
    TestBed.tick();
    TestBed.inject(HttpTestingController)
      .expectOne('/build-info/architecture.json')
      .flush({
        projects: [
          {
            name: 'api',
            root: 'libs/api',
            kind: 'lib',
            domain: 'shared',
            layer: 'api',
            dependencies: [],
          },
        ],
        rules: [{ from: 'type:api', to: [] }],
      });
    await settle();

    // Assert
    expect(store.projects()[0].name).toBe('api');
    expect(store.rules()[0].from).toBe('type:api');
  });

  it('reports missing build info as an error, with empty data', async () => {
    // Arrange
    const store = TestBed.inject(VersionStore);

    // Act
    TestBed.tick();
    TestBed.inject(HttpTestingController)
      .expectOne('/build-info/versions.json')
      .flush('', { status: 404, statusText: 'Not Found' });
    await settle();

    // Assert
    expect(store.error()).toBeTruthy();
    expect(store.packages()).toEqual([]);
  });
});
