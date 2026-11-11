# cv-feature-skills

The CV's skills page: every skill category with its entries and their level
(0–5), loaded through `SkillStore` from `@cv/cv-data-access-skills`.

The barrel exports `SkillList` by name, so the cv shell lazy-loads it with
`loadComponent: () => import('@cv/cv-feature-skills').then((m) => m.SkillList)`. A named export is
needed: ng-packagr drops `export default` from a built lib.
