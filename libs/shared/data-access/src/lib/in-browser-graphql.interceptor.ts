import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import type { GraphqlRequest } from '@axel-pauwels/cv-api';
import { from, map } from 'rxjs';
import { GRAPHQL_ENDPOINT } from './graphql-resource';

/**
 * Answers `POST /graphql` in the browser against the in-memory schema.
 *
 * The schema and graphql-js are lazy-loaded on the first query, so they never
 * block bootstrap. Every other request goes to the network as usual.
 */
export const inBrowserGraphqlInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'POST' || req.url !== GRAPHQL_ENDPOINT) {
    return next(req);
  }

  return from(
    import('@axel-pauwels/cv-api').then(({ executeOperation }) =>
      executeOperation(req.body as GraphqlRequest)
    )
  ).pipe(map((body) => new HttpResponse({ status: 200, url: req.url, body })));
};
