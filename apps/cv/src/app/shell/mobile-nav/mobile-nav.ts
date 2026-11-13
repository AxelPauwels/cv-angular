import { Component, computed, inject, input, resource } from '@angular/core';
import { NavAccordion, NavItem } from '@cv/shared-ui-layout';
import { FeatureToggleService } from '@cv/shared-data-access';
import { delayedLoading } from '@cv/shared-util-loading';
import { ROUTES } from '@cv/shared-util-routing';
import { TranslatePipe } from '@tolgee/ngx';

type Pages = readonly (NavItem & { toggle?: string })[];

let pages: Promise<Record<string, Pages>> | undefined;

/**
 * Every domain's pages, each list owned by its (lazy) feature shell: imported
 * dynamically, so they stay out of the initial bundle. Loaded once; a failed
 * load is tried again the next time
 */
function loadPages(): Promise<Record<string, Pages>> {
  pages ??= Promise.all([
    import('@cv/cv-feature-shell'),
    import('@cv/technical-feature-shell'),
    import('@cv/showcase-feature-shell'),
  ]).then(
    ([cv, technical, showcase]) => ({
      [ROUTES.CV.ROOT]: cv.CV_NAV_ITEMS,
      [ROUTES.TECHNICAL.ROOT]: technical.TECHNICAL_NAV_ITEMS,
      [ROUTES.SHOWCASE.ROOT]: showcase.SHOWCASE_NAV_ITEMS,
    }),
    (error: unknown) => {
      pages = undefined;
      throw error;
    }
  );
  return pages;
}

// Started as soon as this chunk loads: the shell prefetches it once the menu
// button is on screen, so the pages are usually in before the menu opens
// (instead of a second round trip after opening it)
loadPages().catch(() => undefined);

/**
 * The mobile menu's content: the domains with their pages (home is a link of
 * its own). Rendered in a `@defer` block once the menu first opens.
 */
@Component({
  selector: 'app-mobile-nav',
  imports: [NavAccordion, TranslatePipe],
  template: `
    @if (loading.indicator()) {
      <div class="mobile-nav__loading" role="status">
        <span class="c-spinner" aria-hidden="true"></span>
        <span class="cdk-visually-hidden">{{
          't.nav.menu-loading' | translate
        }}</span>
      </div>
    } @else if (items(); as items) {
      <ds-nav-accordion [items]="items" />
    }
  `,
  styles: `
    .mobile-nav__loading {
      display: flex;
      justify-content: center;
      padding: 1rem;
    }
  `,
})
export class MobileNav {
  /** The domains of the main navbar (already filtered on their toggles) */
  readonly domains = input.required<readonly NavItem[]>();

  private readonly toggles = inject(FeatureToggleService).states;
  private readonly pages = resource({ loader: loadPages });

  /** No spinner flash when the (prefetched) pages are already in */
  protected readonly loading = delayedLoading(() => this.pages.isLoading());

  /** The pages switched off on the admin page are left out */
  protected readonly items = computed<NavItem[] | undefined>(() => {
    if (!this.pages.hasValue()) {
      return undefined;
    }
    const pages = this.pages.value();
    const toggles: Partial<Record<string, boolean>> = this.toggles();
    // a domain without pages (home) stays a plain link
    return this.domains().map((domain) =>
      domain.path in pages
        ? {
            ...domain,
            children: pages[domain.path].filter(
              ({ toggle }) => !toggle || toggles[toggle]
            ),
          }
        : domain
    );
  });
}
