# showcase-feature-micro-frontends

The Showcase's micro-frontends page: the `cv-mfe` remote, loaded at runtime
with Native Federation, next to the `mac-window` component library, with a
short explanation of where each comes from.

The barrel default-exports `MicroFrontends`, so the showcase shell lazy-loads
it with `loadComponent: () => import('@cv/showcase-feature-micro-frontends')`.
