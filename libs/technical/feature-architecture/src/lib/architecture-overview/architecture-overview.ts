import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { PageLayout, PageTitle, SectionHeading } from '@cv/shared-ui-page';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import {
  ArchitectureStore,
  ProjectInfo,
} from '@cv/technical-data-access-build-info';
import { ScrollEdges } from '../internal/scroll-edges/scroll-edges';
import { NgTemplateOutlet } from '@angular/common';
import { TranslatePipe } from '@tolgee/ngx';
import { TranslationKey } from '@cv/shared-util-i18n';
import { TranslatePartsPipe } from '@cv/shared-ui-i18n';

/** Known domains and layers first, in reading order; anything new follows */
const DOMAIN_ORDER = ['cv', 'showcase', 'technical', 'shared'];
const LAYER_ORDER = ['feature', 'ui', 'data-access', 'util', 'api'];

const byOrder = (order: string[]) => (a: string, b: string) =>
  (order.indexOf(a) + 1 || order.length + 1) -
    (order.indexOf(b) + 1 || order.length + 1) || a.localeCompare(b);

/** A number on top of the page */
interface Stat {
  icon: string;
  label: TranslationKey;
  value: number;
}

/** A sheriff tag in words: a translation key, or the bare tag name */
export interface TagLabel {
  key?: TranslationKey;
  name?: string;
}

/** Tags that read as words; the generator writes sheriff's `sameTag` as `same domain` */
const TAG_KEYS: Record<string, TranslationKey> = {
  root: 't.architecture.tag.root',
  '*': 't.architecture.tag.everything',
  'domain:*': 't.architecture.tag.every-domain',
  'same domain': 't.architecture.tag.same-domain',
};

/** `type:feature` -> `feature`, `domain:*` -> the key for `every domain`, ... */
export function describeTag(tag: string): TagLabel {
  const key = TAG_KEYS[tag];
  return key ? { key } : { name: tag.replace(/^(type|domain):/, '') };
}

/** `['same domain', 'domain:shared']` -> the key for `same domain`, then `shared` */
export function describeTargets(tags: string[]): TagLabel[] {
  return tags.map(describeTag);
}

/**
 * How the workspace is cut: domains (vertical slices) by layers, the rules
 * sheriff enforces between them, and what every project depends on. All of
 * it is generated from the Nx project graph and sheriff.config.ts.
 */
@Component({
  selector: 'technical-architecture-overview',
  imports: [
    PageLayout,
    PageTitle,
    SectionHeading,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelDescription,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatIcon,
    MatProgressBar,
    MatTableModule,
    ScrollEdges,
    NgTemplateOutlet,
    TranslatePipe,
    TranslatePartsPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './architecture-overview.html',
  styleUrl: './architecture-overview.scss',
})
export class ArchitectureOverview {
  protected readonly store = inject(ArchitectureStore);
  protected readonly describeTargets = describeTargets;
  protected readonly ruleColumns = ['from', 'to'];

  protected readonly libs = computed(() =>
    this.store.projects().filter((project) => project.kind === 'lib')
  );

  protected readonly apps = computed(() =>
    this.store.projects().filter((project) => project.kind !== 'lib')
  );

  protected readonly domains = computed(() =>
    [...new Set(this.libs().map((project) => project.domain ?? '–'))].sort(
      byOrder(DOMAIN_ORDER)
    )
  );

  protected readonly layers = computed(() =>
    [...new Set(this.libs().map((project) => project.layer ?? '–'))].sort(
      byOrder(LAYER_ORDER)
    )
  );

  /** The matrix columns: the row header, then one per layer */
  protected readonly matrixColumns = computed(() => [
    'domain',
    ...this.layers(),
  ]);

  /** domain -> layer -> projects, for the matrix */
  protected readonly matrix = computed(() => {
    const cells = new Map<string, ProjectInfo[]>();
    for (const project of this.libs()) {
      const key = `${project.domain ?? '–'}|${project.layer ?? '–'}`;
      cells.set(key, [...(cells.get(key) ?? []), project]);
    }
    return cells;
  });

  /** Projects grouped per domain, for the dependency lists */
  protected readonly projectsByDomain = computed(() =>
    this.domains().map((domain) => ({
      domain,
      projects: this.libs().filter(
        (project) => (project.domain ?? '–') === domain
      ),
    }))
  );

  /** The numbers on top of the page */
  protected readonly stats = computed((): Stat[] => [
    {
      icon: 'web',
      label: 't.architecture.stat.apps',
      value: this.apps().length,
    },
    {
      icon: 'category',
      label: 't.architecture.stat.domains',
      value: this.domains().length,
    },
    {
      icon: 'layers',
      label: 't.architecture.stat.layers',
      value: this.layers().length,
    },
    {
      icon: 'deployed_code',
      label: 't.architecture.stat.libraries',
      value: this.libs().length,
    },
  ]);

  protected cell(domain: string, layer: string): ProjectInfo[] {
    return this.matrix().get(`${domain}|${layer}`) ?? [];
  }
}
