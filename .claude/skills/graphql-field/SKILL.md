---
name: graphql-field
description: Add, rename, change or remove a field (or type/enum value) in the GraphQL schema and carry it through the whole stack - schema, repository data, codegen, client operations, mappers, frontend types, features, translations and tests. Use whenever the user wants to change what data the CV API exposes or a feature needs a new property from the API.
---

# Change a GraphQL field end to end

The schema is the single source of truth. A change flows in one direction:

```
type-defs.graphql → api codegen → repository data
                  → client operations (.graphql) → client codegen → mapper → frontend types → features/ui
```

## 0. Understand the change

- Which GraphQL type and field, which domain lib(s) query it (`grep -rl "on <Type>" libs/*/data-access-*/src`), which features show it.
- Nullable or required? Prefer `!` (required) unless the data is genuinely optional; optional fields cost null checks everywhere.
- Is it a user-facing string? Then the API holds a **translation key** (`t.<domain>.<...>`), not the text itself.
- If the change would hurt performance, accessibility or security (e.g. a large payload, an unbounded list, exposing personal data like a phone number or address), **stop and ask** first (see AGENTS.md).
- Removing or renaming a field is breaking: find every usage first and tell the user what will change.

## 1. Schema: `libs/api/src/lib/schema/type-defs.graphql`

Edit the type. Add a `"description"` string to non-obvious fields. Use existing scalars (`DateTime`) and enums before adding new ones.

## 2. Server codegen and data

```sh
npx nx run api:codegen
```

This regenerates `libs/api/src/lib/internal/generated/resolvers-types.ts` and `libs/api/src/lib/generated/type-defs.ts`. Then update the data in `libs/api/src/lib/internal/repositories/<type>.repository.ts` (typed with the generated types, so the compiler tells you what's missing). Only touch `libs/api/src/lib/schema/resolvers.ts` for a new root `Query` field or a field resolver.

## 3. Client operations

In each affected data-access lib, `src/lib/internal/operations/`:

- add the field to the **fragment** (`fragments/<type>.fragment.graphql`), not directly in the query
- new root field → new query in `queries/<type>.queries.graphql` spreading the fragment

Select only what the frontend uses: unused fields are wasted bytes on every load.

## 4. Client codegen

```sh
npx nx run <data-access-project>:codegen      # e.g. cv-data-access-experience
npm run codegen                                # or: api + every client, when several libs are affected
```

Never hand-edit anything under `generated/`; it's committed, so include it in the change.

## 5. Frontend types and mapper (same data-access lib)

- `src/lib/types/<type>.types.ts`: the hand-written frontend model. Use frontend-friendly shapes (`Date` via `toPeriod` from `@cv/shared-util-types`, `[]` instead of `null` for lists, `/** translation key */` doc comments).
- `src/lib/internal/mappers/<type>.mapper.ts`: map the generated `...FieldsFragment` to the frontend type. This is the only place that knows both.
- Generated types stay internal: never export them from `src/index.ts` or import them in features/ui.

## 6. Features and UI

Use the new property from the store in the feature component/template; pass it down to `ui` components as an input. Keep it accessible: semantic elements, labels, no meaning carried by color alone.

## 7. Translations

For new translation keys, add the English text to `libs/shared/data-access-i18n/src/i18n/en.json` and the same key to `nl.json`, `fr.json`, `es.json` (ask the user for the translations if you don't have them; don't invent Dutch/French/Spanish copy silently). Remind the user to `npm run i18n:push`.

## 8. Tests and verification

Update the service/store specs (`*.service.spec.ts`, `*.store.spec.ts`) and the feature specs that assert the mapped model, then run:

```sh
npx nx affected -t lint test build
npm run sheriff:verify
```

Fix failures at the source; never loosen types, add `any`, or disable lint rules to get green. Finish with a short summary: schema change, libs touched, codegen run, open questions (e.g. missing translations).
