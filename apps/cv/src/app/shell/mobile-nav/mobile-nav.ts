import { Component, computed, inject, input, resource } from '@angular/core';
import { NavAccordion, NavItem } from '@cv/shared-ui-design-system';
import { FeatureToggleService } from '@cv/shared-data-access';
import { ROUTES } from '@cv/shared-util-routing';
import { TranslatePipe } from '@tolgee/ngx';

type Pages = readonly (NavItem & { toggle?: string })[];

/**
 * Every domain's pages, each list owned by its (lazy) feature shell: imported
 * dynamically, so they stay out of the initial bundle
 */
async function loadPages(): Promise<Record<string, Pages>> {
  const [cv, technical, showcase] = await Promise.all([
    import('@cv/cv-feature-shell'),
    import('@cv/technical-feature-shell'),
    import('@cv/showcase-feature-shell'),
  ]);
  return {
    [ROUTES.CV.ROOT]: cv.CV_NAV_ITEMS,
    [ROUTES.TECHNICAL.ROOT]: technical.TECHNICAL_NAV_ITEMS,
    [ROUTES.SHOWCASE.ROOT]: showcase.SHOWCASE_NAV_ITEMS,
  };
}

/**
 * The mobile menu's content: the domains with their pages. Rendered in a
 * `@defer` block once the menu first opens.
 */
@Component({
  selector: 'app-mobile-nav',
  imports: [NavAccordion, TranslatePipe],
  template: `
    @if (items(); as items) {
      <ds-nav-accordion [items]="items" />
    } @else {
      <div class="mobile-nav__loading" role="status">
        <span class="c-spinner" aria-hidden="true"></span>
        <span class="cdk-visually-hidden">{{
          't.nav.menu-loading' | translate
        }}</span>
      </div>
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

  /** The pages switched off on the admin page are left out */
  protected readonly items = computed<NavItem[] | undefined>(() => {
    if (!this.pages.hasValue()) {
      return undefined;
    }
    const pages = this.pages.value();
    const toggles: Partial<Record<string, boolean>> = this.toggles();
    return this.domains().map((domain) => ({
      ...domain,
      children: (pages[domain.path] ?? []).filter(
        ({ toggle }) => !toggle || toggles[toggle]
      ),
    }));
  });
}
