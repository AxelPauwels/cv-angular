import {
  httpUrl,
  linkServices,
  pageServices,
  remoteServices,
} from './service-sources';

describe('service sources', () => {
  it('only accepts http(s) URLs', () => {
    // Act & Assert
    expect(httpUrl('https://example.com/a')?.href).toBe(
      'https://example.com/a'
    );
    expect(httpUrl('javascript:alert(1)')).toBeUndefined();
    expect(httpUrl('not a url')).toBeUndefined();
    expect(httpUrl(42)).toBeUndefined();
  });

  it('lists each remote of the federation manifest', () => {
    // Act
    const services = remoteServices(
      {
        'cv-mfe': 'https://remote.example/remoteEntry.json',
        bad: 'ftp://x',
        other: 3,
      },
      'https://app.example/'
    );

    // Assert
    expect(services).toEqual([
      {
        id: 'remote:cv-mfe',
        name: '<cv-mfe>',
        category: 'micro-frontend',
        url: 'https://remote.example/remoteEntry.json',
        check: 'status',
      },
    ]);
  });

  it('lists the other origins the page loads from, once each', () => {
    // Arrange
    const html = document.implementation.createHTMLDocument('test');
    html.head.innerHTML = `
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Icons" />
      <link rel="stylesheet" href="/styles.css" />
      <script src="https://cdn.example/lib.js"></script>`;

    // Act
    const services = pageServices(html);

    // Assert
    expect(
      services.map(({ name, url, check }) => ({ name, url, check }))
    ).toEqual([
      {
        name: 'Google Fonts (CSS)',
        url: 'https://fonts.googleapis.com/css2?family=Icons',
        check: 'status',
      },
      {
        name: 'cdn.example',
        url: 'https://cdn.example/lib.js',
        check: 'reachability',
      },
      {
        name: 'Google Fonts (files)',
        url: 'https://fonts.gstatic.com/',
        check: 'reachability',
      },
    ]);
  });

  it('lists the profile links that are set', () => {
    // Act
    const services = linkServices({
      person: {
        contact: {
          website: 'https://me.example/personal',
          linkedIn: 'https://www.linkedin.com/in/me/',
          github: null,
        },
      },
      additionalLearnings: [
        {
          uuid: 'u1',
          name: 'Pluralsight',
          url: 'https://pluralsight.example/me',
        },
      ],
    });

    // Assert
    expect(services.map(({ id, name }) => [id, name])).toEqual([
      ['link:linkedin', 'LinkedIn'],
      ['link:website', 'me.example'],
      ['link:u1', 'Pluralsight'],
    ]);
    expect(services.every(({ check }) => check === 'reachability')).toBe(true);
  });
});
