# cv-api

GraphQL schema for the CV app: type definitions, resolvers and in-memory
repositories (plain TypeScript arrays/objects, no database).

The schema is framework-agnostic. Today it runs **in the browser** through an
MSW service worker (`apps/cv/src/mocks`), so the app can be deployed as static
files while the network tab still shows real `POST /graphql` requests.

Later, the same `schema` can be served by `@apollo/server` from a Cloud
Function without changing the Angular app:

```ts
import { ApolloServer } from '@apollo/server';
import { typeDefs, resolvers } from '@cv/cv-api';

const server = new ApolloServer({ typeDefs, resolvers });
```
