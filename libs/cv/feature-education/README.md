# cv-feature-education

The CV's education page: schools, certificates and additional learnings,
loaded through `EducationStore` from `@cv/cv-data-access-education`.

The barrel default-exports `EducationList`, so the cv shell lazy-loads it with
`loadComponent: () => import('@cv/cv-feature-education')`.
