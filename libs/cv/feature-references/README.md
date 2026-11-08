# cv-feature-references

The CV's references page: references grouped per work category, loaded through
`ReferenceStore` from `@cv/cv-data-access-references`.

The barrel default-exports `ReferenceList`, so the cv shell lazy-loads it with
`loadComponent: () => import('@cv/cv-feature-references')`.
