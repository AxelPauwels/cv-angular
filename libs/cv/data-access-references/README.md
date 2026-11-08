# cv-data-access-references

Loads references from the api, as frontend types.

```
src/lib/reference.store.ts            ReferenceStore: loads once, shared app-wide, public
src/lib/types/                   the frontend types, public
src/lib/internal/services/       GraphQL resources, mapped to the frontend types
src/lib/internal/mappers/        generated API types -> frontend types
src/lib/internal/operations/     GraphQL fragments and queries
src/lib/internal/generated/      generated from the operations, do not edit
```

Everything in `internal/` is private to the lib: only the store and the
types are exported. Features never see the API's types, so an API change is
absorbed in the mapper.

```ts
protected readonly store = inject(ReferenceStore);

// template: store.references(), store.isLoading(), store.error()
```

```sh
npx nx run cv-data-access-references:codegen   # after changing an operation
```
