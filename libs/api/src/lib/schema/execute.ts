import { ExecutionResult, graphql } from 'graphql';
import { schema } from './schema';

export interface GraphqlRequest {
  query: string;
  variables?: Record<string, unknown>;
  operationName?: string;
}

/** Runs a GraphQL operation against the in-memory schema. */
export function executeOperation({
  query,
  variables,
  operationName,
}: GraphqlRequest): Promise<ExecutionResult> {
  return graphql({
    schema,
    source: query,
    variableValues: variables,
    operationName,
  });
}
