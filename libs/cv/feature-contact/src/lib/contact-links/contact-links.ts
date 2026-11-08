import { Component, computed, inject } from '@angular/core';
import { TranslatePipe } from '@tolgee/ngx';
import { PersonStore } from '@cv/cv-data-access-personal';
import { Lordicon, type LordiconName } from '@cv/shared-ui-lordicon';

interface ContactLink {
  href: string;
  icon: LordiconName;
  label: string;
  translate: boolean;
}

@Component({
  selector: 'cv-contact-links',
  imports: [Lordicon, TranslatePipe],
  templateUrl: './contact-links.html',
  styleUrl: './contact-links.scss',
})
export class ContactLinks {
  private readonly store = inject(PersonStore);

  protected readonly links = computed((): ContactLink[] => {
    const contact = this.store.person()?.contact;
    if (!contact) {
      return [];
    }

    const links: ContactLink[] = [
      {
        href: `mailto:${contact.email}`,
        icon: 'mail',
        label: 't.common.email',
        translate: true,
      },
    ];

    if (contact.linkedIn) {
      links.push({
        href: contact.linkedIn,
        icon: 'linkedin',
        label: 'LinkedIn',
        translate: false,
      });
    }
    if (contact.github) {
      links.push({
        href: contact.github,
        icon: 'github',
        label: 'GitHub',
        translate: false,
      });
    }

    return links;
  });
}
