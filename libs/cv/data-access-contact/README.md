# cv-data-access-contact

Everything the contact form needs to send a message, without the form itself.

- `ContactMessage` and `EMPTY_CONTACT_MESSAGE`: the frontend type of a message
- `contactSchema` and `CONTACT_LIMITS`: the Signal Forms validation rules (required fields, e-mail, lengths)
- `ContactSender`: posts the message to [Web3Forms](https://web3forms.com) (`WEB3FORMS_ENDPOINT`); the site is static, so there is no own mail backend
- `provideContact({ web3formsAccessKey })` / `CONTACT_CONFIG`: the access key, provided once in `app.config.ts`

The access key comes from the environment: the gitignored tokens file locally, the
`WEB3FORMS_ACCESS_KEY` secret in CI (see `scripts/build-production.sh`).

> Sending is real: every submit, also from `localhost`, delivers an e-mail.

```sh
npx nx run cv-data-access-contact:test
```
