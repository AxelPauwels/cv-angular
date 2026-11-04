import type { CodegenConfig } from '@graphql-codegen/cli';

const lib = 'libs/api/src/lib';

/**
 * Server-side code from the schema, the single source of truth:
 * resolver types, and the SDL as a string for makeExecutableSchema.
 * Run with `nx run api:codegen` (or `npm run codegen` for every project).
 */
const config: CodegenConfig = {
  schema: `${lib}/schema/type-defs.graphql`,
  generates: {
    [`${lib}/internal/generated/resolvers-types.ts`]: {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        // string unions instead of TS enums: no runtime code, erasable syntax
        enumsAsTypes: true,
        strictScalars: true,
        // repositories hold Dates, graphql-scalars serializes them to ISO strings
        scalars: { DateTime: 'Date' },
        useTypeImports: true,
      },
    },
    [`${lib}/generated/type-defs.ts`]: {
      plugins: ['./libs/api/codegen-type-defs-plugin.cjs'],
    },
  },
  hooks: { afterAllFileWrite: ['prettier --write'] },
};

export default config;
