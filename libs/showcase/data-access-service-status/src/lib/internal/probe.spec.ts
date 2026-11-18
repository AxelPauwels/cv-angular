import type { ExternalService } from '../types/service-status.types';
import { probe } from './probe';

const statusService: ExternalService = {
  id: 'remote:cv-mfe',
  name: '<cv-mfe>',
  category: 'micro-frontend',
  url: 'https://remote.example/remoteEntry.json',
  check: 'status',
};
const linkService: ExternalService = {
  ...statusService,
  id: 'link:github',
  category: 'link',
  url: 'https://github.example/',
  check: 'reachability',
};

/** A clock that advances `elapsed` ms between the request and the answer */
function clock(elapsed: number) {
  let time = 0;
  return () => (time += elapsed) - elapsed;
}

function answer(status: number): typeof fetch {
  return vi.fn().mockResolvedValue(new Response(null, { status }));
}

describe('probe', () => {
  it('is up with the status code when a status check answers 2xx', async () => {
    // Act
    const result = await probe(statusService, {
      fetch: answer(200),
      now: clock(120),
    });

    // Assert
    expect(result).toEqual({
      health: 'up',
      httpStatus: 200,
      responseTimeMs: 120,
    });
  });

  it('warns on a client error', async () => {
    // Act
    const result = await probe(statusService, {
      fetch: answer(404),
      now: clock(50),
    });

    // Assert
    expect(result).toMatchObject({
      health: 'degraded',
      issue: 'client-error',
      httpStatus: 404,
    });
  });

  it('fails on a server error', async () => {
    // Act
    const result = await probe(statusService, {
      fetch: answer(503),
      now: clock(50),
    });

    // Assert
    expect(result).toMatchObject({
      health: 'down',
      issue: 'server-error',
      httpStatus: 503,
    });
  });

  it('warns when the answer is slow', async () => {
    // Act
    const result = await probe(statusService, {
      fetch: answer(200),
      now: clock(2500),
      slowAfterMs: 2000,
    });

    // Assert
    expect(result).toMatchObject({ health: 'degraded', issue: 'slow' });
  });

  it('fails when the service cannot be reached', async () => {
    // Arrange
    const fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    // Act
    const result = await probe(linkService, { fetch });

    // Assert
    expect(result).toEqual({ health: 'down', issue: 'unreachable' });
  });

  it('fails when there is no answer in time', async () => {
    // Arrange
    const fetch = vi.fn(
      (_url: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_, reject) =>
          init?.signal?.addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError'))
          )
        )
    );

    // Act
    const result = await probe(linkService, { fetch, timeoutAfterMs: 10 });

    // Assert
    expect(result).toEqual({ health: 'down', issue: 'timeout' });
  });

  it('checks a link without CORS, cookies or referrer, and without a status', async () => {
    // Arrange
    const fetch = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 200 }));

    // Act
    const result = await probe(linkService, { fetch, now: clock(80) });

    // Assert
    expect(fetch).toHaveBeenCalledWith(
      linkService.url,
      expect.objectContaining({
        method: 'HEAD',
        mode: 'no-cors',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        cache: 'no-store',
      })
    );
    expect(result).toEqual({ health: 'up', responseTimeMs: 80 });
  });
});
