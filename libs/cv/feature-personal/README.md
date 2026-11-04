# cv-feature-personal

The CV's personal page: about me, contact, hobbies and languages, loaded through
`PersonStore` from `@cv/cv-data-access-personal`.

The barrel default-exports `PersonalDetails`, so the cv shell lazy-loads it with
`loadComponent: () => import('@cv/cv-feature-personal')`.
