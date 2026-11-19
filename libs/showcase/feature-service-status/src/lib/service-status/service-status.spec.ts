import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import {
  ServiceStatus,
  ServiceStatusStore,
} from '@cv/showcase-data-access-service-status';
import { ServiceStatusPage } from './service-status';

const STATUSES: ServiceStatus[] = [
  {
    id: 'remote:cv-mfe',
    name: '<cv-mfe>',
    category: 'micro-frontend',
    url: 'https://remote.example/remoteEntry.json',
    check: 'status',
    health: 'up',
    httpStatus: 200,
    responseTimeMs: 42,
  },
  {
    id: 'link:linkedin',
    name: 'LinkedIn',
    category: 'link',
    url: 'https://www.linkedin.com/in/me/',
    check: 'reachability',
    health: 'down',
    issue: 'unreachable',
  },
];

/** Every other kind of status, each on its own row */
const OTHER_STATUSES: ServiceStatus[] = [
  ['slow', 'degraded', 200],
  ['client-error', 'degraded', 404],
  ['server-error', 'down', undefined],
  ['timeout', 'down', undefined],
  [undefined, 'up', undefined],
  [undefined, 'checking', undefined],
].map(([issue, health, httpStatus], index) => ({
  id: `api:${index}`,
  name: `API ${index}`,
  category: 'api',
  url: 'https://api.example/',
  check: 'status',
  health,
  issue,
  httpStatus,
})) as ServiceStatus[];

function render(
  isChecking = false,
  {
    statuses = STATUSES,
    checked = true,
    linksError = undefined as unknown,
  } = {}
) {
  const checkedAt = checked ? Date.UTC(2026, 10, 18, 10, 0, 0) : undefined;
  const recheck = vi.fn();
  TestBed.configureTestingModule({
    imports: [ServiceStatusPage],
    providers: [provideI18nTesting()],
  });
  // overrideProvider, not overrideComponent: that one compiles the template
  // again at runtime, which leaves it out of the code coverage
  TestBed.overrideProvider(ServiceStatusStore, {
    useValue: {
      statuses: signal(statuses),
      counts: signal({ checking: 0, up: 1, degraded: 0, down: 1 }),
      isChecking: signal(isChecking),
      checkedAt: signal(checkedAt),
      linksError: signal(linksError),
      recheck,
    },
  });
  const fixture = TestBed.createComponent(ServiceStatusPage);
  fixture.detectChanges();
  return { element: fixture.nativeElement as HTMLElement, recheck };
}

describe('ServiceStatusPage', () => {
  it('groups the services by category, with their status in words', () => {
    // Act
    const { element } = render();

    // Assert
    const headings = [...element.querySelectorAll('h2')].map((h) =>
      h.textContent?.trim()
    );
    expect(headings).toEqual(['Micro-frontends', 'Links']);
    const rows = [...element.querySelectorAll('tbody tr')].map(
      (row) => row.textContent
    );
    expect(rows[0]).toContain('OK (HTTP 200)');
    expect(rows[0]).toContain('42 ms');
    expect(rows[1]).toContain('Unreachable');
  });

  it('announces the summary', () => {
    // Act
    const { element } = render();

    // Assert
    expect(element.querySelector('[role="status"]')?.textContent).toContain(
      'Reachable: 1 · Warnings: 0 · Errors: 1'
    );
  });

  it('checks again on click, but not while checking', () => {
    // Arrange
    const idle = render();

    // Act
    idle.element.querySelector('button')?.click();

    // Assert
    expect(idle.recheck).toHaveBeenCalledOnce();
  });

  it('keeps the button focusable while checking', () => {
    // Arrange
    const { element, recheck } = render(true);
    const button = element.querySelector('button');

    // Act
    button?.click();

    // Assert
    expect(button?.getAttribute('aria-disabled')).toBe('true');
    expect(recheck).not.toHaveBeenCalled();
    expect(element.querySelector('[role="status"]')?.textContent).toContain(
      'Checking'
    );
  });

  it('opens each service in a new tab, without sharing the page', () => {
    // Act
    const { element } = render();

    // Assert
    const link = element.querySelector('tbody a');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('names every issue in words, and shows a short address', () => {
    // Act
    const { element } = render(false, {
      statuses: OTHER_STATUSES,
      checked: false,
      linksError: new Error('offline'),
    });

    // Assert
    const statuses = [
      ...element.querySelectorAll('tbody td:first-of-type'),
    ].map((cell) => cell.textContent?.trim());
    expect(statuses).toEqual([
      'Slow',
      'HTTP 404',
      'HTTP',
      'No answer in time',
      'Reachable',
      'Checking…',
    ]);
    expect(element.querySelector('.service-status__address')?.textContent).toBe(
      'api.example'
    );
    expect(
      element.querySelector('.service-status__time')?.textContent
    ).toContain('–');
    expect(element.querySelector('.service-status__checked-at')).toBeNull();
    expect(element.querySelector('.service-status__error')).not.toBeNull();
  });
});
