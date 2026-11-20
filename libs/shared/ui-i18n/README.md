# shared-ui-i18n

Translation pipes for templates, on top of Tolgee's `translate` pipe.

- `translateParts`: a translation with inline `<code>` or `<strong>`, split into parts the
  template renders as real elements, without `innerHTML`
- `translateList`: a translation holding a list (items joined with `||`), as an array
- `localDate`: a date formatted for the active language

The pipes update when the visitor switches language.

```sh
npx nx run shared-ui-i18n:test
```
