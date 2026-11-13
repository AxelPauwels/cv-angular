import ROUTES_DEFAULT, { ROUTES } from './routes';

type DomainName = keyof typeof ROUTES;
type DomainRoutes = Record<string, string>;

const LINK_SUFFIX = '_ROUTER_LINK';
const domains = Object.keys(ROUTES) as DomainName[];

/** `ROOT` is the domain's mount path; domains without one live at the app root */
function rootOf(routes: DomainRoutes): string {
  return routes['ROOT'] ?? '';
}

/** The path segments of a domain: every key except its router links and ROOT */
function pathsOf(routes: DomainRoutes): [string, string][] {
  return Object.entries(routes).filter(
    ([key]) => key !== 'ROOT' && !key.endsWith(LINK_SUFFIX)
  );
}

describe('ROUTES', () => {
  it('exposes every domain, also as default export', () => {
    // Arrange
    const expected = ['HOME', 'CV', 'SHOWCASE', 'TECHNICAL', 'MF'];

    // Act
    const exposed = Object.keys(ROUTES);

    // Assert
    expect(exposed).toEqual(expected);
    expect(ROUTES_DEFAULT).toBe(ROUTES);
  });

  describe.each(domains)('%s', (domain) => {
    const routes: DomainRoutes = ROUTES[domain];
    const root = rootOf(routes);

    it('has a router link for every path and a path for every router link', () => {
      // Arrange
      const keys = Object.keys(routes);

      // Act
      const paths = keys.filter((key) => !key.endsWith(LINK_SUFFIX));
      const links = keys
        .filter((key) => key.endsWith(LINK_SUFFIX))
        .map((key) => key.slice(0, -LINK_SUFFIX.length));

      // Assert
      expect(links.sort()).toEqual(paths.sort());
    });

    it('builds every router link from the domain root and its path', () => {
      // Arrange
      const expectedLink = (path: string) =>
        root ? `/${root}/${path}` : `/${path}`;

      // Act
      const links = pathsOf(routes).map(([key, path]) => ({
        key,
        actual: routes[`${key}${LINK_SUFFIX}`],
        expected: expectedLink(path),
      }));

      // Assert
      for (const { key, actual, expected } of links) {
        expect(actual, key).toBe(expected);
      }
      if ('ROOT' in routes) {
        expect(routes[`ROOT${LINK_SUFFIX}`]).toBe(`/${root}`);
      }
    });

    it('uses lowercase kebab-case path segments without slashes', () => {
      // Arrange
      const kebabCase = /^[a-z0-9]+(-[a-z0-9]+)*$/;

      // Act
      const segments = pathsOf(routes);

      // Assert
      for (const [key, path] of segments) {
        expect(path, key).toMatch(kebabCase);
      }
      if (root) {
        expect(root).toMatch(kebabCase);
      }
    });

    it('has no duplicate paths', () => {
      // Arrange
      const paths = pathsOf(routes).map(([, path]) => path);

      // Act
      const unique = new Set(paths);

      // Assert
      expect(unique.size).toBe(paths.length);
    });
  });

  it('gives every url exactly one owner', () => {
    // Arrange
    // MF is mounted at '', so its paths share the top level with the other
    // domains' roots; a clash would make one domain unreachable.
    const urls = domains.flatMap((domain) =>
      Object.entries(ROUTES[domain] as DomainRoutes)
        .filter(([key]) => key.endsWith(LINK_SUFFIX))
        .map(([, url]) => url)
    );

    // Act
    const duplicates = urls.filter((url, i) => urls.indexOf(url) !== i);

    // Assert
    expect(duplicates).toEqual([]);
  });
});
