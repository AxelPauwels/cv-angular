# cv-feature-contact

The icon links in the shell's footer: the contact page, LinkedIn and GitHub, plus
the AI assistant while its showcase feature toggle is on.

Exports `ContactLinks` (`cv-contact-links`). The urls come from `PersonStore`
([`@cv/cv-data-access-personal`](../data-access-personal)); the contact page and the
assistant are router links, the profiles external links. Every link is icon-only,
with its (translated) label as accessible name and tooltip.

```sh
npx nx run cv-feature-contact:test
```
