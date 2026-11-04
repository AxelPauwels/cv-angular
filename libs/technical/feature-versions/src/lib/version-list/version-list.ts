import { Component, computed, inject } from '@angular/core';
import {
  PackageVersion,
  VersionStore,
} from '@cv/technical-data-access-build-info';

/** The frameworks and tools this app is built with, grouped by category */
@Component({
  selector: 'technical-version-list',
  templateUrl: './version-list.html',
  styleUrl: './version-list.scss',
})
export class VersionList {
  protected readonly store = inject(VersionStore);

  /** One group per category, in the order the generator lists them */
  protected readonly groups = computed(() => {
    const groups = new Map<string, PackageVersion[]>();
    for (const entry of this.store.packages()) {
      groups.set(entry.category, [
        ...(groups.get(entry.category) ?? []),
        entry,
      ]);
    }
    return [...groups].map(([category, packages]) => ({ category, packages }));
  });

  protected npmUrl(entry: PackageVersion): string | undefined {
    return entry.range
      ? `https://www.npmjs.com/package/${entry.name}`
      : undefined;
  }
}
