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

  /** The remotes load next to the versions: none here */
  const noRemotes = () =>
    TestBed.inject(HttpTestingController)
      .expectOne('federation.manifest.json')
      .flush({});

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
    noRemotes();
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
    noRemotes();
    await settle();

    // Assert
    expect(store.error()).toBeTruthy();
    expect(store.packages()).toEqual([]);
  });

  it('has no projects or rules while the architecture is missing', async () => {
    // Arrange
    const store = TestBed.inject(ArchitectureStore);

    // Act
    TestBed.tick();
    TestBed.inject(HttpTestingController)
      .expectOne('/build-info/architecture.json')
      .flush('', { status: 404, statusText: 'Not Found' });
    await settle();

    // Assert
    expect(store.error()).toBeTruthy();
    expect(store.projects()).toEqual([]);
    expect(store.rules()).toEqual([]);
  });

  it('is loading, with no versions yet, until the answer arrives', () => {
    // Arrange
    const store = TestBed.inject(VersionStore);

    // Act
    TestBed.tick();

    // Assert
    TestBed.inject(HttpTestingController).expectOne(
      '/build-info/versions.json'
    );
    expect(store.isLoading()).toBe(true);
    expect(store.packages()).toEqual([]);
    expect(store.error()).toBeUndefined();
  });

  it('is loading, with no projects or rules yet, until the answer arrives', () => {
    // Arrange
    const store = TestBed.inject(ArchitectureStore);

    // Act
    TestBed.tick();

    // Assert
    TestBed.inject(HttpTestingController).expectOne(
      '/build-info/architecture.json'
    );
    expect(store.isLoading()).toBe(true);
    expect(store.projects()).toEqual([]);
    expect(store.rules()).toEqual([]);
  });

  it('fetches the build info only once, however often it is injected', () => {
    // Arrange
    const first = TestBed.inject(VersionStore);

    // Act
    const second = TestBed.inject(VersionStore);
    TestBed.tick();

    // Assert
    expect(second).toBe(first);
    TestBed.inject(HttpTestingController).expectOne(
      '/build-info/versions.json'
    );
  });

  it('fetches the versions again on reload', async () => {
    // Arrange
    const store = TestBed.inject(VersionStore);
    const http = TestBed.inject(HttpTestingController);
    TestBed.tick();
    http
      .expectOne('/build-info/versions.json')
      .flush('', { status: 404, statusText: 'Not Found' });
    noRemotes();
    await settle();

    // Act
    store.reload();
    TestBed.tick();
    http.expectOne('/build-info/versions.json').flush({ packages: [] });
    noRemotes();
    await settle();

    // Assert
    expect(store.error()).toBeUndefined();
    expect(store.isLoading()).toBe(false);
  });

  it('fetches the architecture again on reload', async () => {
    // Arrange
    const store = TestBed.inject(ArchitectureStore);
    const http = TestBed.inject(HttpTestingController);
    TestBed.tick();
    http
      .expectOne('/build-info/architecture.json')
      .flush('', { status: 404, statusText: 'Not Found' });
    await settle();

    // Act
    store.reload();
    TestBed.tick();
    http
      .expectOne('/build-info/architecture.json')
      .flush({ projects: [], rules: [] });
    await settle();

    // Assert
    expect(store.error()).toBeUndefined();
    expect(store.isLoading()).toBe(false);
  });

  describe('remote versions', () => {
    const versions = (http: HttpTestingController) =>
      http.expectOne('/build-info/versions.json').flush({ packages: [] });

    it('lists each remote of the manifest with its deployed version', async () => {
      // Arrange
      const store = TestBed.inject(VersionStore);
      const http = TestBed.inject(HttpTestingController);
      TestBed.tick();
      versions(http);

      // Act
      http.expectOne('federation.manifest.json').flush({
        'cv-mfe': 'https://remote.example/remoteEntry.json',
      });
      await vi.waitFor(() =>
        http
          .expectOne('https://remote.example/version.json')
          .flush({ name: '@axel-pauwels/cv-mfe', version: '1.2.0' })
      );
      await settle();

      // Assert
      expect(store.packages()).toEqual([
        {
          category: 'Micro-frontends',
          name: '@axel-pauwels/cv-mfe',
          label: 'cv-mfe (remote)',
          version: '1.2.0',
          remote: true,
          url: 'https://remote.example/',
        },
      ]);
    });

    it('shows a remote that cannot be reached as unavailable', async () => {
      // Arrange
      const store = TestBed.inject(VersionStore);
      const http = TestBed.inject(HttpTestingController);
      TestBed.tick();
      versions(http);

      // Act
      http.expectOne('federation.manifest.json').flush({
        'cv-mfe': 'https://remote.example/remoteEntry.json',
      });
      await vi.waitFor(() =>
        http
          .expectOne('https://remote.example/version.json')
          .flush('', { status: 404, statusText: 'Not Found' })
      );
      await settle();

      // Assert
      expect(store.packages()[0]).toMatchObject({
        name: 'cv-mfe',
        version: 'unavailable',
      });
    });

    it('shows no unexpected values from a remote', async () => {
      // Arrange
      const store = TestBed.inject(VersionStore);
      const http = TestBed.inject(HttpTestingController);
      TestBed.tick();
      versions(http);

      // Act
      http.expectOne('federation.manifest.json').flush({
        'cv-mfe': 'https://remote.example/remoteEntry.json',
        other: 'javascript:alert(1)',
      });
      await vi.waitFor(() =>
        http
          .expectOne('https://remote.example/version.json')
          .flush({ name: '<img src=x>', version: 'latest<script>' })
      );
      await settle();

      // Assert
      const [cvMfe, other] = store.packages();
      expect(cvMfe).toMatchObject({ name: 'cv-mfe', version: 'unavailable' });
      expect(other).toMatchObject({ name: 'other', version: 'unavailable' });
      expect(other.url).toBeUndefined();
    });
  });
});
