import { Component, computed, inject } from '@angular/core';
import { PageTitle } from '@cv/shared-ui-page';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { Card } from '@cv/shared-ui-card';
import { TranslatePartsPipe } from '@cv/shared-ui-i18n';
import { TranslationKey } from '@cv/shared-util-i18n';
import { TranslatePipe } from '@tolgee/ngx';
import {
  PackageVersion,
  VersionStore,
} from '@cv/technical-data-access-build-info';

/** A Material Symbol and a label per category of tools/build-info/generate.mjs */
const CATEGORIES: Record<string, { icon: string; labelKey: TranslationKey }> = {
  Runtime: { icon: 'terminal', labelKey: 't.versions.category.runtime' },
  Framework: { icon: 'code', labelKey: 't.versions.category.framework' },
  UI: { icon: 'palette', labelKey: 't.versions.category.ui' },
  State: { icon: 'memory', labelKey: 't.versions.category.state' },
  'Micro-frontends': {
    icon: 'view_quilt',
    labelKey: 't.versions.category.micro-frontends',
  },
  API: { icon: 'api', labelKey: 't.versions.category.api' },
  i18n: { icon: 'translate', labelKey: 't.versions.category.i18n' },
  Monorepo: { icon: 'inventory_2', labelKey: 't.versions.category.monorepo' },
  Architecture: {
    icon: 'architecture',
    labelKey: 't.versions.category.architecture',
  },
  Testing: { icon: 'science', labelKey: 't.versions.category.testing' },
  'Code quality': {
    icon: 'verified',
    labelKey: 't.versions.category.code-quality',
  },
};

@Component({
  selector: 'technical-version-list',
  imports: [
    PageTitle,
    Card,
    MatProgressBar,
    MatTableModule,
    TranslatePipe,
    TranslatePartsPipe,
  ],
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
      icon: CATEGORIES[category]?.icon ?? 'deployed_code',
      // a new category shows as the generator names it until it gets a key
      labelKey: CATEGORIES[category]?.labelKey,
      packages,
    }));
  });

  /** A remote links to its deployment, an installed package to npm */
  protected link(entry: PackageVersion): string | undefined {
    if (entry.remote) {
      return entry.url;
    }
    return entry.range
      ? `https://www.npmjs.com/package/${entry.name}`
      : undefined;
  }
}
