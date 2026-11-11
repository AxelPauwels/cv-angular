# cv-feature-references

The CV's references page: references grouped per work category, loaded through
`ReferenceStore` from `@cv/cv-data-access-references`.

The barrel exports `ReferenceList` by name, so the cv shell lazy-loads it with
`loadComponent: () => import('@cv/cv-feature-references').then((m) => m.ReferenceList)`. A named export is
needed: ng-packagr drops `export default` from a built lib.
