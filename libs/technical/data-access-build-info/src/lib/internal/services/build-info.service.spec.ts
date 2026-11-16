import { ApplicationRef, Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { FEDERATION_MANIFEST_URL } from '@cv/shared-data-access';
import { BuildInfoService } from './build-info.service';

describe('BuildInfoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: FEDERATION_MANIFEST_URL, useValue: '/manifest.json' },
      ],
    });
  });

  // resources need an injection context, like a store's withProps
  function load<T>(create: (service: BuildInfoService) => T): T {
    const service = TestBed.inject(BuildInfoService);
    return runInInjectionContext(TestBed.inject(Injector), () =>
      create(service)
    );
  }

  const http = () => TestBed.inject(HttpTestingController);
  const settle = () => TestBed.inject(ApplicationRef).whenStable();

  /** Loads the remotes of the given manifest, answering every version.json */
  async function remotes(
    manifest: Record<string, unknown>,
    answer: (url: string) => unknown = () => ({})
  ) {
    const resource = load((service) => service.remoteVersions());
    TestBed.tick();
    http().expectOne('/manifest.json').flush(manifest);
    await vi.waitFor(() => {
      for (const request of http().match(() => true)) {
        request.flush(answer(request.request.url) as object);
      }
      expect(resource.isLoading()).toBe(false);
    });
    await settle();
    return resource;
  }

  it('reads the packages from versions.json', async () => {
    // Arrange
    const versions = load((service) => service.versions());
    TestBed.tick();

    // Act
    http()
      .expectOne('/build-info/versions.json')
      .flush({
        packages: [
          {
            category: 'UI',
            name: '@angular/material',
            label: 'Material',
            version: '22.2.5',
          },
        ],
      });
    await settle();

    // Assert
    expect(versions.value()).toEqual([
      {
        category: 'UI',
        name: '@angular/material',
        label: 'Material',
        version: '22.2.5',
      },
    ]);
  });

  it('reads the projects and rules from architecture.json', async () => {
    // Arrange
    const architecture = load((service) => service.architecture());
    TestBed.tick();

    // Act
    http()
      .expectOne('/build-info/architecture.json')
      .flush({ projects: [], rules: [{ from: 'type:ui', to: ['type:util'] }] });
    await settle();

    // Assert
    expect(architecture.value()).toEqual({
      projects: [],
      rules: [{ from: 'type:ui', to: ['type:util'] }],
    });
  });

  it('resolves a relative remote entry against this page', async () => {
    // Arrange
    const manifest = { local: 'remotes/local/remoteEntry.json' };
    const base = new URL('remotes/local/', document.baseURI).href;

    // Act
    const resource = await remotes(manifest, (url) =>
      url === `${base}version.json`
        ? { name: 'local-mfe', version: '0.1.0' }
        : {}
    );

    // Assert
    expect(resource.value()).toEqual([
      {
        category: 'Micro-frontends',
        name: 'local-mfe',
        label: 'local (remote)',
        version: '0.1.0',
        remote: true,
        url: base,
      },
    ]);
  });

  it('lists a remote without an entry url, and asks it nothing', async () => {
    // Arrange: a manifest entry may be an object in other federation setups
    const manifest = { odd: { remoteEntry: 'x' } };

    // Act
    const resource = await remotes(manifest);

    // Assert
    expect(resource.value()).toEqual([
      {
        category: 'Micro-frontends',
        name: 'odd',
        label: 'odd (remote)',
        version: 'unavailable',
        remote: true,
      },
    ]);
    http().verify();
  });

  it('only follows http and https entries', async () => {
    // Arrange
    const manifest = { ftp: 'ftp://files.example/remoteEntry.json' };

    // Act
    const resource = await remotes(manifest);

    // Assert
    expect(resource.value()?.[0]).toMatchObject({ version: 'unavailable' });
    expect(resource.value()?.[0].url).toBeUndefined();
    http().verify();
  });

  it('keeps the remote unavailable when its version.json is empty', async () => {
    // Arrange
    const manifest = { 'cv-mfe': 'https://remote.example/remoteEntry.json' };

    // Act
    const resource = await remotes(manifest, () => null);

    // Assert
    expect(resource.value()?.[0]).toMatchObject({
      name: 'cv-mfe',
      version: 'unavailable',
      url: 'https://remote.example/',
    });
  });

  it('reports a manifest that cannot be loaded as an error', async () => {
    // Arrange
    const resource = load((service) => service.remoteVersions());
    TestBed.tick();

    // Act
    http()
      .expectOne('/manifest.json')
      .flush('', { status: 404, statusText: 'Not Found' });
    await settle();

    // Assert
    expect(resource.error()).toBeDefined();
    expect(resource.hasValue()).toBe(false);
  });
});
