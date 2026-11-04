# api

The CV's GraphQL server: schema, resolvers and in-memory repositories
(plain TypeScript data, no database).

The schema is **schema-first**: [`type-defs.graphql`](src/lib/schema/type-defs.graphql)
is the single source of truth. GraphQL Codegen generates from it:

- `src/lib/internal/generated/resolvers-types.ts`: the resolver and model types, so
  repositories and resolvers fail typecheck when they drift from the schema
- `src/lib/generated/type-defs.ts`: the SDL as a string, so no bundler needs a
  `.graphql` loader (made by `codegen-type-defs-plugin.cjs`)

Client operations don't live here: each domain's data-access library owns its
own (e.g. [`@cv/cv-data-access-experience`](../cv/data-access-experience)).
The types generated there for the operations stay private to that library: it
maps them to hand-written frontend types, so features never see API types.

```sh
npx nx run api:codegen   # after changing type-defs.graphql
npm run codegen          # every codegen target (server and clients)
```

Today the schema runs **in the browser** through `inBrowserGraphqlInterceptor`
(`@cv/shared-data-access`), lazy-loaded on the first query, so the app deploys
as static files. Later, the same exports can be served by `@apollo/server`
from a Cloud Function without changing the Angular app:

```ts
import { ApolloServer } from '@apollo/server';
import { typeDefs, resolvers } from '@cv/api';

const server = new ApolloServer({ typeDefs, resolvers });
```
