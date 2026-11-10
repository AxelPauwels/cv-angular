import {
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  inject,
  signal,
} from '@angular/core';
import { delayedLoading } from '@cv/shared-util-loading';
import { LoadingSpinner } from '@cv/shared-ui-loading-spinner';
import { PageTitle, PageLayout } from '@cv/shared-ui-page';
import { NgTemplateOutlet } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@tolgee/ngx';
import { Reference, ReferenceStore } from '@cv/cv-data-access-references';
import { Card } from '@cv/shared-ui-card';
import { Timeline, TimelineItem } from '@cv/shared-ui-timeline';
import { byEndNewestFirst } from '@cv/shared-util-types';

/**
 * `Roel Frison` -> `RF`: the first letters of the first and the last name, so
 * name particles in between (`Jan van den Berg` -> `JB`) are left out
 */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words.at(0);
  const last = words.length > 1 ? words.at(-1) : undefined;
  return [first, last]
    .map((word) => (word ? Array.from(word)[0] : ''))
    .join('')
    .toLocaleUpperCase();
}

/** The references at one employer, or at one of its clients */
export interface ReferenceColumn {
  /** The employer or the client */
  name: string;
  references: Reference[];
}

/** One step of the timeline: an employer with its own references and its clients' */
export interface ReferenceGroup {
  work: string;
  start: Date;
  /** `null` while any of its references is still current */
  end: Date | null;
  /** The references at the employer itself (may be empty) */
  employer: ReferenceColumn;
  /** The references at the employer's clients, one column part per client */
  clients: ReferenceColumn[];
}

/**
 * Groups references per employer (`work`), the most recent end first (ongoing ones lead). References at a client
 * of the employer (`client`) go into the employer's group, per client.
 */
export function groupByWork(
  references: readonly Reference[]
): ReferenceGroup[] {
  const groups = new Map<string, ReferenceGroup>();
  for (const reference of references) {
    const { start, end } = reference.workCategoryPeriod;
    let group = groups.get(reference.work);
    if (!group) {
      group = {
        work: reference.work,
        start,
        end: end ?? null,
        employer: { name: reference.work, references: [] },
        clients: [],
      };
      groups.set(reference.work, group);
    }
    if (start < group.start) group.start = start;
    if (group.end && (!end || end > group.end)) group.end = end ?? null;

    if (!reference.client) {
      group.employer.references.push(reference);
      continue;
    }
    let client = group.clients.find((c) => c.name === reference.client);
    if (!client) {
      client = { name: reference.client, references: [] };
      group.clients.push(client);
    }
    client.references.push(reference);
  }
  return [...groups.values()].sort(byEndNewestFirst);
}

/** The width below which a step shows one column (keep in sync with the scss) */
const NARROW_QUERY = '(width < 600px)';

/**
 * The IT references as the same year timeline as the experiences: one step per
 * employer (newest first, the newest open), with its references as cards. When
 * references worked with me at a client of the employer, they get a second column
 * next to the employer's. The API also has the hospitality references; they're left
 * out here as less relevant.
 *
 * On a narrow screen the columns stack, the clients first: they're rendered in
 * that order (not reordered with css), so screen readers follow what's shown.
 */
@Component({
  selector: 'cv-reference-list',
  imports: [
    PageLayout,
    LoadingSpinner,
    PageTitle,
    Card,
    NgTemplateOutlet,
    MatIcon,
    Timeline,
    TimelineItem,
    TranslatePipe,
  ],
  templateUrl: './reference-list.html',
  styleUrl: './reference-list.scss',
})
export class ReferenceList {
  protected readonly store = inject(ReferenceStore);
  protected readonly loading = delayedLoading(() => this.store.isLoading());
  protected readonly initials = initials;

  /** Whether the screen is too narrow for two columns, following resizes */
  protected readonly narrow = signal(false);

  constructor() {
    const query = inject(DOCUMENT).defaultView?.matchMedia?.(NARROW_QUERY);
    if (query) {
      this.narrow.set(query.matches);
      const update = (event: MediaQueryListEvent) =>
        this.narrow.set(event.matches);
      query.addEventListener('change', update);
      inject(DestroyRef).onDestroy(() =>
        query.removeEventListener('change', update)
      );
    }
  }

  protected readonly groups = computed(() =>
    groupByWork(
      this.store
        .references()
        .filter((reference) => reference.workCategory === 'IT')
    )
  );
}
