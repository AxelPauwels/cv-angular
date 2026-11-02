import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { MatToolbar } from '@angular/material/toolbar';
import { MatTabLink, MatTabNav, MatTabNavPanel } from '@angular/material/tabs';
import { NavItem } from '../nav-item';

/**
 * Toolbar with one tab per domain. The layout owns the content area: it passes
 * the `mat-tab-nav-panel` around its routed content as `tabPanel`.
 */
@Component({
  selector: 'lib-main-navbar',
  imports: [RouterLink, MatToolbar, MatTabNav, MatTabLink],
  templateUrl: './main-navbar.html',
  styleUrl: './main-navbar.scss',
})
export class MainNavbar {
  private readonly router = inject(Router);

  readonly items = input.required<NavItem[]>();
  readonly tabPanel = input.required<MatTabNavPanel>();

  private readonly firstSegment = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => firstSegmentOf(event.urlAfterRedirects))
    ),
    { initialValue: firstSegmentOf(this.router.url) }
  );

  /**
   * The item whose path matches the first url segment. An item with path `''`
   * (the root domain) is active for every url no other item claims.
   */
  protected readonly activeItem = computed(() => {
    const items = this.items();
    return (
      items.find((item) => item.path && item.path === this.firstSegment()) ??
      items.find((item) => !item.path)
    );
  });
}

function firstSegmentOf(url: string): string {
  return url.split(/[?#;]/)[0].split('/').find(Boolean) ?? '';
}
