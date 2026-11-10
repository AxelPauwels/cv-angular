import { Component, input, linkedSignal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@tolgee/ngx';
import { NavTranslationKey } from '@cv/shared-util-i18n';
import { NavItem } from '../nav-item';
import { activeNavItem } from '../internal/active-nav-item';

let nextId = 0;

/**
 * The whole navigation as an accordion: one button per domain that shows its
 * pages (`children`), one domain open at a time. The domain of the current url
 * starts open. Used in a `ds-mobile-menu`.
 */
@Component({
  selector: 'ds-nav-accordion',
  imports: [RouterLink, RouterLinkActive, MatIcon, TranslatePipe],
  templateUrl: './nav-accordion.html',
  styleUrl: './nav-accordion.scss',
})
export class NavAccordion {
  readonly items = input.required<readonly NavItem[]>();
  readonly labelKey = input<NavTranslationKey>('t.nav.main-navigation');

  protected readonly idPrefix = `ds-nav-accordion-${nextId++}`;
  protected readonly activeItem = activeNavItem(this.items);

  /** The open domain; follows the url until a visitor opens another one */
  protected readonly expanded = linkedSignal<NavItem | undefined>(() =>
    this.activeItem()
  );

  protected toggle(item: NavItem): void {
    this.expanded.update((open) => (open === item ? undefined : item));
  }

  protected linkOf(parent: NavItem, child: NavItem): string {
    return '/' + [parent.path, child.path].filter(Boolean).join('/');
  }
}
