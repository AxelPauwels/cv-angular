import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@tolgee/ngx';
import type { ExperienceCategory } from '@cv/cv-data-access-experience';
import { Reference, ReferenceStore } from '@cv/cv-data-access-references';

@Component({
  selector: 'cv-reference-list',
  imports: [DatePipe, TranslatePipe],
  templateUrl: './reference-list.html',
})
export class ReferenceList {
  protected readonly store = inject(ReferenceStore);

  protected readonly categoryKeys: Record<ExperienceCategory, string> = {
    IT: 't.subheading.it',
    HORECA: 't.subheading.horeca',
  };

  /** One group per work category, in the order the categories first appear */
  protected readonly groups = computed(() => {
    const groups = new Map<ExperienceCategory, Reference[]>();
    for (const reference of this.store.references()) {
      groups.set(reference.workCategory, [
        ...(groups.get(reference.workCategory) ?? []),
        reference,
      ]);
    }
    return [...groups].map(([category, references]) => ({
      category,
      references,
    }));
  });
}
