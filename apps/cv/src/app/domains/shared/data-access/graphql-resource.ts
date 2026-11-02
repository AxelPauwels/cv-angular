import { httpResource, HttpResourceRef } from '@angular/common/http';

export const GRAPHQL_ENDPOINT = '/graphql';

interface GraphqlResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

/**
 * Signal-based GraphQL query: sends `POST /graphql` through HttpClient
 * (answered in the browser by `inBrowserGraphqlInterceptor` for now).
 *
 * `variables` may be a function reading signals; the query re-runs when they change.
 */
export function graphqlResource<T>(
  query: string,
  variables: () => Record<string, unknown> = () => ({})
): HttpResourceRef<T | undefined> {
  return httpResource<T>(
    () => ({
      url: GRAPHQL_ENDPOINT,
      method: 'POST',
      body: { query, variables: variables() },
    }),
    {
      parse: (raw) => {
        const response = raw as GraphqlResponse<T>;
        if (response.errors?.length) {
          throw new Error(response.errors.map((e) => e.message).join('\n'));
        }
        return response.data as T;
      },
    }
  );
}
