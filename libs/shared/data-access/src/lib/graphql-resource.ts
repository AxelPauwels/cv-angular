import { httpResource, HttpResourceRef } from '@angular/common/http';
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';

export const GRAPHQL_ENDPOINT = '/graphql';

interface GraphqlResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

export interface GraphqlResourceOptions<TResult, TVariables, TValue> {
  /** May read signals: the query re-runs when they change */
  variables?: () => TVariables;
  /** Maps the API's result to the frontend model, so the API types stay in data-access */
  map?: (data: TResult) => TValue;
}

/**
 * Signal-based GraphQL query: sends `POST /graphql` through HttpClient
 * (answered in the browser by `inBrowserGraphqlInterceptor` for now).
 *
 * `document` is a generated typed document (e.g. `SkillsDocument`), so the
 * result and variables are typed by the operation itself. A data-access
 * service passes `map` to return its own model instead of the API's types.
 */
export function graphqlResource<
  TResult,
  TVariables extends Record<string, unknown>,
>(
  document: DocumentTypeDecoration<TResult, TVariables>,
  options?: { variables?: () => TVariables }
): HttpResourceRef<TResult | undefined>;
export function graphqlResource<
  TResult,
  TVariables extends Record<string, unknown>,
  TValue,
>(
  document: DocumentTypeDecoration<TResult, TVariables>,
  options: GraphqlResourceOptions<TResult, TVariables, TValue> & {
    map: (data: TResult) => TValue;
  }
): HttpResourceRef<TValue | undefined>;
export function graphqlResource<
  TResult,
  TVariables extends Record<string, unknown>,
  TValue,
>(
  document: DocumentTypeDecoration<TResult, TVariables>,
  { variables, map }: GraphqlResourceOptions<TResult, TVariables, TValue> = {}
): HttpResourceRef<TResult | TValue | undefined> {
  const query = document.toString();
  return httpResource<TResult | TValue>(
    () => ({
      url: GRAPHQL_ENDPOINT,
      method: 'POST',
      body: { query, variables: variables?.() ?? {} },
    }),
    {
      parse: (raw) => {
        const response = raw as GraphqlResponse<TResult>;
        if (response.errors?.length) {
          throw new Error(response.errors.map((e) => e.message).join('\n'));
        }
        const data = response.data as TResult;
        return map ? map(data) : data;
      },
    }
  );
}
