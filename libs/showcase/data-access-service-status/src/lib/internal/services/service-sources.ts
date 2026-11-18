import type { ExternalService } from '../../types/service-status.types';
import type { ServiceStatusLinksQuery } from '../generated/graphql';

/**
 * APIs the app calls only when a visitor uses them, so they aren't in the page:
 * the contact form (Web3Forms) and the AI assistant (Firebase AI Logic). Only
 * their origin is checked, without a body: checking never sends a message or
 * starts a model.
 */
export const API_SERVICES: readonly ExternalService[] = [
  {
    id: 'api:web3forms',
    name: 'Web3Forms',
    category: 'api',
    url: 'https://api.web3forms.com/',
    check: 'reachability',
  },
  {
    id: 'api:firebase-ai',
    name: 'Firebase AI Logic',
    category: 'api',
    url: 'https://firebasevertexai.googleapis.com/',
    check: 'reachability',
  },
];

/** Names (and whether they allow CORS) of the hosts the page itself loads from */
const KNOWN_HOSTS: Readonly<
  Record<string, Pick<ExternalService, 'name' | 'check'>>
> = {
  'fonts.googleapis.com': { name: 'Google Fonts (CSS)', check: 'status' },
  'fonts.gstatic.com': { name: 'Google Fonts (files)', check: 'reachability' },
};

/** An absolute http(s) URL, or `undefined` for anything else (external input) */
export function httpUrl(value: unknown, base?: string): URL | undefined {
  if (typeof value !== 'string' || !value) {
    return undefined;
  }
  try {
    const url = new URL(value, base);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url
      : undefined;
  } catch {
    return undefined;
  }
}

/** Each remote of the federation manifest (remote name → remoteEntry.json) */
export function remoteServices(
  manifest: unknown,
  base: string
): ExternalService[] {
  if (!manifest || typeof manifest !== 'object') {
    return [];
  }
  return Object.entries(manifest).flatMap(([remote, entry]) => {
    const url = httpUrl(entry, base);
    return url
      ? [
          {
            id: `remote:${remote}`,
            name: `<${remote}>`,
            category: 'micro-frontend' as const,
            url: url.href,
            check: 'status' as const,
          },
        ]
      : [];
  });
}

/**
 * The other origins the page loads from or connects to: its stylesheets (e.g.
 * the icon font's CSS) and the origins it preconnects to (e.g. the font files).
 * Read from the document, so a CDN added to index.html shows up by itself.
 */
export function pageServices(document: Document): ExternalService[] {
  const own = document.location?.origin;
  const services = new Map<string, ExternalService>();

  const add = (href: string | null, wholeUrl: boolean) => {
    const url = httpUrl(href, document.baseURI);
    if (!url || url.origin === own || services.has(url.origin)) {
      return;
    }
    const known = KNOWN_HOSTS[url.hostname];
    services.set(url.origin, {
      id: `cdn:${url.hostname}`,
      name: known?.name ?? url.hostname,
      category: 'cdn',
      // a stylesheet is checked as the page loads it, a preconnect by its origin
      url: wholeUrl ? url.href : `${url.origin}/`,
      // an unknown host may not allow CORS: only ask whether it answers
      check: (wholeUrl && known?.check) || 'reachability',
    });
  };

  document
    .querySelectorAll<HTMLLinkElement>('link[rel~="stylesheet"][href]')
    .forEach((link) => add(link.getAttribute('href'), true));
  document
    .querySelectorAll<HTMLScriptElement>('script[src]')
    .forEach((script) => add(script.getAttribute('src'), true));
  document
    .querySelectorAll<HTMLLinkElement>('link[rel~="preconnect"][href]')
    .forEach((link) => add(link.getAttribute('href'), false));

  return [...services.values()];
}

/** The profile links of the CV: website, LinkedIn, GitHub and learning profiles */
export function linkServices({
  person,
  additionalLearnings,
}: ServiceStatusLinksQuery): ExternalService[] {
  const { website, linkedIn, github } = person.contact;
  const links: [id: string, name: string, href: string | null][] = [
    ['link:linkedin', 'LinkedIn', linkedIn],
    ['link:github', 'GitHub', github],
    // the site's own name: no word to translate
    ['link:website', httpUrl(website)?.hostname ?? '', website],
    ...additionalLearnings.map(
      ({ uuid, name, url }): [string, string, string] => [
        `link:${uuid}`,
        name,
        url,
      ]
    ),
  ];
  return links.flatMap(([id, name, href]) => {
    const url = httpUrl(href);
    return url
      ? [
          {
            id,
            name,
            category: 'link' as const,
            url: url.href,
            check: 'reachability' as const,
          },
        ]
      : [];
  });
}
