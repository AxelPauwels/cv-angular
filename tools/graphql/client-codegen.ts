import type { CodegenConfig } from '@graphql-codegen/cli';

/**
 * Codegen for a data-access library: typed documents for the operations in
 * `<projectRoot>/src/lib/internal/operations`, validated against the api schema.
 *
 * The generated types describe the API's wire format. They stay private to
 * the data-access library (never exported from its index.ts): its mapper turns
 * them into the hand-written frontend types in `src/lib/types`.
 */
export function clientCodegen(projectRoot: string): CodegenConfig {
  const lib = `${projectRoot}/src/lib`;
  return {
    schema: 'libs/api/src/lib/schema/type-defs.graphql',
    documents: `${lib}/internal/operations/**/*.graphql`,
    generates: {
      [`${lib}/internal/generated/graphql.ts`]: {
        // only the types the operations select, no full schema dump
        plugins: ['typescript-operations', 'typed-document-node'],
        config: {
          // plain strings at runtime: no graphql-js or AST in the client bundle
          documentMode: 'string',
          enumType: 'string-literal',
          strictScalars: true,
          // JSON carries dates as ISO strings
          scalars: { DateTime: 'string' },
          useTypeImports: true,
        },
      },
    },
    hooks: { afterAllFileWrite: ['prettier --write'] },
  };
}
