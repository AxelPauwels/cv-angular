import { computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { NavItem } from '../nav-item';

/**
 * The item whose path matches the first url segment. An item with path `''`
 * (the root domain) is active for every url no other item claims. Call it in
 * an injection context.
 */
export function activeNavItem(
  items: Signal<readonly NavItem[]>
): Signal<NavItem | undefined> {
  const router = inject(Router);
  const firstSegment = toSignal(
    router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => firstSegmentOf(event.urlAfterRedirects))
    ),
    { initialValue: firstSegmentOf(router.url) }
  );
  return computed(() => {
    const all = items();
    return (
      all.find((item) => item.path && item.path === firstSegment()) ??
      all.find((item) => !item.path)
    );
  });
}

function firstSegmentOf(url: string): string {
  return url.split(/[?#;]/)[0].split('/').find(Boolean) ?? '';
}
