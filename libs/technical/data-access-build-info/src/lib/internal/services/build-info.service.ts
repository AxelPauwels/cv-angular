import { inject, resource, ResourceRef, Service } from '@angular/core';
import {
  HttpClient,
  httpResource,
  HttpResourceRef,
} from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type {
  Architecture,
  PackageVersion,
} from '../../types/build-info.types';
import { FEDERATION_MANIFEST_URL } from '@cv/shared-data-access';

/** Generated at build time and copied into the build, see apps/cv/project.json */
export const BUILD_INFO_URL = '/build-info';

/** The category the remotes are listed under, next to Native Federation */
const REMOTE_CATEGORY = 'Micro-frontends';

const SEMVER = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;
const PACKAGE_NAME = /^(?:@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*$/;

@Service()
export class BuildInfoService {
  private readonly http = inject(HttpClient);
  private readonly manifestUrl = inject(FEDERATION_MANIFEST_URL);

  versions(): HttpResourceRef<PackageVersion[] | undefined> {
    return httpResource(() => `${BUILD_INFO_URL}/versions.json`, {
      parse: (raw) => (raw as { packages: PackageVersion[] }).packages,
    });
  }

  architecture(): HttpResourceRef<Architecture | undefined> {
    return httpResource(() => `${BUILD_INFO_URL}/architecture.json`, {
      parse: (raw) => raw as Architecture,
    });
  }

  /**
   * The version each remote of the federation manifest is deployed with, from
   * its `version.json` next to its `remoteEntry.json`. Read at runtime: a
   * remote deploys on its own, so this app's build can't know it. A remote
   * that can't be reached is listed without a version.
   */
  remoteVersions(): ResourceRef<PackageVersion[] | undefined> {
    return resource({
      loader: async () => {
        const manifest = await firstValueFrom(
          this.http.get<Record<string, unknown>>(this.manifestUrl)
        );
        return Promise.all(
          Object.entries(manifest).map(([remote, entry]) =>
            this.remoteVersion(remote, entry)
          )
        );
      },
    });
  }

  private async remoteVersion(
    remote: string,
    remoteEntry: unknown
  ): Promise<PackageVersion> {
    const base = remoteBaseUrl(remoteEntry);
    const row: PackageVersion = {
      category: REMOTE_CATEGORY,
      name: remote,
      label: `${remote} (remote)`,
      version: 'unavailable',
      remote: true,
      ...(base ? { url: base } : {}),
    };
    if (!base) {
      return row;
    }
    try {
      const info = await firstValueFrom(
        this.http.get<unknown>(new URL('version.json', base).href)
      );
      // external input: only a plain package name and version are shown
      const { name, version } = (info ?? {}) as Record<string, unknown>;
      return {
        ...row,
        ...(typeof name === 'string' && PACKAGE_NAME.test(name)
          ? { name }
          : {}),
        ...(typeof version === 'string' && SEMVER.test(version)
          ? { version }
          : {}),
      };
    } catch {
      return row;
    }
  }
}

/** The folder of an http(s) remoteEntry.json URL, e.g. `https://remote.app/` */
function remoteBaseUrl(remoteEntry: unknown): string | undefined {
  if (typeof remoteEntry !== 'string') {
    return undefined;
  }
  try {
    const url = new URL('.', new URL(remoteEntry, document.baseURI));
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}
