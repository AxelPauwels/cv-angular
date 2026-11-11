# cv-feature-education

The CV's education page: schools, certificates and additional learnings,
loaded through `EducationStore` from `@cv/cv-data-access-education`.

The barrel exports `EducationList` by name, so the cv shell lazy-loads it with
`loadComponent: () => import('@cv/cv-feature-education').then((m) => m.EducationList)`. A named export is
needed: ng-packagr drops `export default` from a built lib.
