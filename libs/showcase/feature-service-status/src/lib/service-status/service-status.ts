import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@tolgee/ngx';
import { LanguageService } from '@cv/shared-data-access-i18n';
import { TranslationKey } from '@cv/shared-util-i18n';
import { PageLayout, PageTitle } from '@cv/shared-ui-page';
import {
  ExternalServiceCategory,
  ServiceHealth,
  ServiceStatus,
  ServiceStatusStore,
} from '@cv/showcase-data-access-service-status';

const CATEGORIES: readonly {
  id: ExternalServiceCategory;
  labelKey: TranslationKey;
}[] = [
  {
    id: 'micro-frontend',
    labelKey: 't.service-status.category.micro-frontend',
  },
  { id: 'cdn', labelKey: 't.service-status.category.cdn' },
  { id: 'api', labelKey: 't.service-status.category.api' },
  { id: 'link', labelKey: 't.service-status.category.link' },
];

/** The text of a status, with its parameters, so it's never told by color alone */
interface StatusText {
  readonly key: TranslationKey;
  readonly params?: Record<string, string>;
}

/**
 * Whether every external service the app depends on can be reached right now,
 * checked from the visitor's browser: green when it answers, orange when it
 * answers slowly or with a client error, red when it doesn't answer or fails.
 */
@Component({
  selector: 'showcase-service-status',
  imports: [PageLayout, PageTitle, MatButton, MatIcon, TranslatePipe],
  providers: [ServiceStatusStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './service-status.html',
  styleUrl: './service-status.scss',
})
export class ServiceStatusPage {
  protected readonly store = inject(ServiceStatusStore);
  private readonly language = inject(LanguageService).language;

  protected readonly legend: readonly ServiceHealth[] = [
    'up',
    'degraded',
    'down',
  ];

  /** The categories with at least one service, each with its services */
  protected readonly sections = computed(() => {
    const statuses = this.store.statuses();
    return CATEGORIES.map((category) => ({
      ...category,
      services: statuses.filter((status) => status.category === category.id),
    })).filter(({ services }) => services.length);
  });

  /** The counts for the summary (translation parameters are strings) */
  protected readonly summary = computed(() => {
    const { up, degraded, down } = this.store.counts();
    return { up: String(up), degraded: String(degraded), down: String(down) };
  });

  /** When the last check finished, in the active language */
  protected readonly checkedAt = computed(() => {
    const checkedAt = this.store.checkedAt();
    return checkedAt === undefined
      ? undefined
      : new Intl.DateTimeFormat(this.language(), {
          timeStyle: 'medium',
        }).format(checkedAt);
  });

  protected statusText(status: ServiceStatus): StatusText {
    const { health, issue, httpStatus } = status;
    switch (issue) {
      case 'slow':
        return { key: 't.service-status.issue.slow' };
      case 'client-error':
      case 'server-error':
        return {
          key: 't.service-status.issue.http',
          params: { status: String(httpStatus ?? '') },
        };
      case 'timeout':
        return { key: 't.service-status.issue.timeout' };
      case 'unreachable':
        return { key: 't.service-status.issue.unreachable' };
    }
    if (health === 'up' && httpStatus !== undefined) {
      return {
        key: 't.service-status.health.up-status',
        params: { status: String(httpStatus) },
      };
    }
    return { key: `t.service-status.health.${health}` };
  }

  protected milliseconds(ms: number): Record<string, string> {
    return { ms: String(ms) };
  }

  /** The host and path, without the protocol: short enough for a table cell */
  protected address(url: string): string {
    const { host, pathname } = new URL(url);
    return pathname === '/' ? host : `${host}${pathname}`;
  }
}
