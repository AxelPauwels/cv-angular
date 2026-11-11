# cv-feature-personal

The CV's personal page: about me, contact, hobbies and languages, loaded through
`PersonStore` from `@cv/cv-data-access-personal`.

The barrel exports `PersonalDetails` by name, so the cv shell lazy-loads it with
`loadComponent: () => import('@cv/cv-feature-personal').then((m) => m.PersonalDetails)`. A named export is
needed: ng-packagr drops `export default` from a built lib.
