# cv-feature-experience

The CV's experience page: every job with its position, company, period and
descriptions, loaded through `ExperienceStore` from
`@cv/cv-data-access-experience`.

The barrel exports `ExperienceList` by name, so the cv shell lazy-loads it with
`loadComponent: () => import('@cv/cv-feature-experience').then((m) => m.ExperienceList)`. A named export is
needed: ng-packagr drops `export default` from a built lib.
