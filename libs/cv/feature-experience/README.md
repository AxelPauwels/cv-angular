# cv-feature-experience

The CV's experience page: every job with its position, company, period and
descriptions, loaded through `ExperienceStore` from
`@cv/cv-data-access-experience`.

The barrel default-exports `ExperienceList`, so the cv shell lazy-loads it with
`loadComponent: () => import('@cv/cv-feature-experience')`.
