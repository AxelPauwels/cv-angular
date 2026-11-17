import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslatePipe } from '@tolgee/ngx';
import { ROUTES } from '@cv/shared-util-routing';
import { FeatureToggleService } from '@cv/shared-data-access';
import { PersonStore } from '@cv/cv-data-access-personal';
import { Lordicon, type LordiconName } from '@cv/shared-ui-lordicon';

interface ContactLink {
  /** An external url, or the contact page as router link */
  href: string;
  routerLink?: boolean;
  icon: LordiconName;
  label: string;
  translate: boolean;
}

@Component({
  selector: 'cv-contact-links',
  imports: [Lordicon, RouterLink, MatTooltip, TranslatePipe],
  templateUrl: './contact-links.html',
  styleUrl: './contact-links.scss',
})
export class ContactLinks {
  private readonly store = inject(PersonStore);
  private readonly toggles = inject(FeatureToggleService).states;

  /** The AI assistant page, while its showcase item is switched on */
  protected readonly aiAssistantLink = computed(() =>
    this.toggles()['showcase-ai-assistant']
      ? ROUTES.SHOWCASE.AI_ASSISTANT_ROUTER_LINK
      : null
  );

  protected readonly links = computed((): ContactLink[] => {
    const contact = this.store.person()?.contact;
    if (!contact) {
      return [];
    }

    const links: ContactLink[] = [
      // the contact page with its form, which mails to this address
      {
        href: ROUTES.CONTACT.ROOT_ROUTER_LINK,
        routerLink: true,
        icon: 'mail',
        label: 't.contact.title',
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
