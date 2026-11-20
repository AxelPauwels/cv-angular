# cv-feature-contact-form

The contact page (`/contact`): a Signal Forms form validated by `contactSchema` and sent through `ContactSender`, both from [`@cv/cv-data-access-contact`](../data-access-contact).

Exports `ContactForm` (`cv-contact-form`) by name, so `app.routes.ts` lazy-loads it with
`loadComponent: () => import('@cv/cv-feature-contact-form').then((m) => m.ContactForm)`.

Errors are announced to screen readers and focus moves to the first invalid field
on submit. The walker figure beside the form follows the walker feature toggle
(wide screens only).

```sh
npx nx run cv-feature-contact-form:test
```
