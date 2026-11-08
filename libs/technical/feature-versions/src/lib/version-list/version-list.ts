import { Component, computed, inject } from '@angular/core';
import { PageTitle } from '@cv/shared-ui-design-system';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { Card } from '@cv/shared-ui-card';
import {
  PackageVersion,
  VersionStore,
} from '@cv/technical-data-access-build-info';

/** A Material Symbol per category of tools/build-info/generate.mjs */
const CATEGORY_ICONS: Record<string, string> = {
  Runtime: 'terminal',
  Framework: 'code',
  UI: 'palette',
  State: 'memory',
  'Micro-frontends': 'view_quilt',
  API: 'api',
  i18n: 'translate',
  Monorepo: 'inventory_2',
  Architecture: 'architecture',
  Testing: 'science',
  'Code quality': 'verified',
};

@Component({
  selector: 'technical-version-list',
  imports: [PageTitle, Card, MatProgressBar, MatTableModule],
  templateUrl: './version-list.html',
  styleUrl: './version-list.scss',
})
export class VersionList {
  protected readonly store = inject(VersionStore);
  protected readonly columns = ['package', 'name', 'version'];

  /** One group per category, in the order the generator lists them */
  protected readonly groups = computed(() => {
    const groups = new Map<string, PackageVersion[]>();
    for (const entry of this.store.packages()) {
      groups.set(entry.category, [
        ...(groups.get(entry.category) ?? []),
        entry,
      ]);
    }
    return [...groups].map(([category, packages]) => ({
      category,
      icon: CATEGORY_ICONS[category] ?? 'deployed_code',
      packages,
    }));
  });

  protected npmUrl(entry: PackageVersion): string | undefined {
    return entry.range
      ? `https://www.npmjs.com/package/${entry.name}`
      : undefined;
  }
}
