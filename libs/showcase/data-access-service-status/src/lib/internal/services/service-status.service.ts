import { DOCUMENT, inject, Service } from '@angular/core';
import { httpResource, HttpResourceRef } from '@angular/common/http';
import {
  FEDERATION_MANIFEST_URL,
  graphqlResource,
} from '@cv/shared-data-access';
import { ServiceStatusLinksDocument } from '../generated/graphql';
import { probe } from '../probe';
import { linkServices, pageServices, remoteServices } from './service-sources';
import type {
  ExternalService,
  ServiceCheckResult,
} from '../../types/service-status.types';

/** Where the external services come from, and how each is checked */
@Service()
export class ServiceStatusService {
  private readonly document = inject(DOCUMENT);
  private readonly manifestUrl = inject(FEDERATION_MANIFEST_URL);

  /** The micro-frontends of the federation manifest */
  remotes(): HttpResourceRef<ExternalService[] | undefined> {
    return httpResource(() => this.manifestUrl, {
      parse: (raw) => remoteServices(raw, this.document.baseURI),
    });
  }

  /** The CDNs the page loads from */
  page(): ExternalService[] {
    return pageServices(this.document);
  }

  /** The profile links of the CV, from the API */
  links(): HttpResourceRef<ExternalService[] | undefined> {
    return graphqlResource(ServiceStatusLinksDocument, { map: linkServices });
  }

  check(service: ExternalService): Promise<ServiceCheckResult> {
    return probe(service);
  }
}
