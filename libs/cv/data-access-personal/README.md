# cv-data-access-personal

Loads the person: contact, personal info, hobbies and languages from the api, as frontend types.

```
src/lib/person.store.ts            PersonStore: loads once, shared app-wide, public
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
protected readonly store = inject(PersonStore);

// template: store.person(), store.isLoading(), store.error()
```

```sh
npx nx run cv-data-access-personal:codegen   # after changing an operation
```
