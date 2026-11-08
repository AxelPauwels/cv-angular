import { Service } from '@angular/core';
import { httpResource, HttpResourceRef } from '@angular/common/http';
import type {
  Architecture,
  PackageVersion,
} from '../../types/build-info.types';

/** Generated at build time and copied into the build, see apps/cv/project.json */
export const BUILD_INFO_URL = '/build-info';

@Service()
export class BuildInfoService {
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
}
