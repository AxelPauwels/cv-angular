import { TestBed } from '@angular/core/testing';
import { EventType, type AGUIEvent } from '@ag-ui/core';
import type { TransportRequest } from '@hashbrownai/core';
import { ASSISTANT_CONFIG, type AssistantConfig } from './assistant-config';
import {
  ASSISTANT_QUOTA_EXCEEDED,
  FirebaseAiTransport,
  isQuotaError,
  RESPONSE_START_TIMEOUT_MS,
} from './firebase-ai-transport';

// no real Firebase: the SDK is loaded lazily, so these stand in for its modules
const firebase = vi.hoisted(() => ({
  apps: [] as { name: string }[],
  initializeApp: vi.fn((_config: unknown, name: string) => ({ name })),
  initializeAppCheck: vi.fn(),
  generateContentStream: vi.fn(),
  getGenerativeModel: vi.fn(),
}));

vi.mock('firebase/app', () => ({
  getApps: () => firebase.apps,
  initializeApp: firebase.initializeApp,
}));
vi.mock('firebase/app-check', () => ({
  initializeAppCheck: firebase.initializeAppCheck,
  ReCaptchaEnterpriseProvider: class {
    constructor(readonly siteKey: string) {}
  },
}));
vi.mock('firebase/ai', () => ({
  getAI: (app: unknown) => ({ app }),
  GoogleAIBackend: class {},
  getGenerativeModel: firebase.getGenerativeModel,
}));

const CONFIG: AssistantConfig = {
  firebase: { apiKey: 'key', projectId: 'project', appId: 'app' },
  recaptchaSiteKey: 'site-key',
  model: 'gemini-test',
};

async function* stream(...texts: string[]) {
  for (const text of texts) {
    yield {
      candidates: [
        {
          index: 0,
          content: { role: 'model', parts: [{ text }] },
          finishReason: 'STOP',
        },
      ],
    };
  }
}

function setup(config: AssistantConfig | null = CONFIG) {
  TestBed.configureTestingModule({
    providers: [{ provide: ASSISTANT_CONFIG, useValue: config }],
  });
  const transport = TestBed.inject(FirebaseAiTransport);

  /** Asks one question and collects every event of the run */
  const ask = async (signal = new AbortController().signal) => {
    const { events } = await transport.send({
      input: {
        threadId: 'thread',
        runId: 'run',
        messages: [{ id: 'm1', role: 'user', content: 'Hi' }],
        tools: [],
        context: [],
        state: {},
        forwardedProps: {},
      },
      signal,
    } as unknown as TransportRequest);
    const collected: AGUIEvent[] = [];
    for await (const event of events) {
      collected.push(event);
    }
    return collected;
  };
  return { transport, ask };
}

const types = (events: AGUIEvent[]) => events.map(({ type }) => type);
const errorOf = (events: AGUIEvent[]) =>
  events.find(({ type }) => type === EventType.RUN_ERROR) as
    { message: string; code?: string } | undefined;

describe('FirebaseAiTransport', () => {
  beforeEach(() => {
    firebase.apps = [];
    firebase.initializeApp.mockClear();
    firebase.initializeAppCheck.mockClear();
    firebase.generateContentStream.mockReset();
    firebase.getGenerativeModel.mockReset();
    firebase.getGenerativeModel.mockImplementation(() => ({
      generateContentStream: firebase.generateContentStream,
    }));
    delete (globalThis as { FIREBASE_APPCHECK_DEBUG_TOKEN?: unknown })
      .FIREBASE_APPCHECK_DEBUG_TOKEN;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fails the run when the assistant is not configured', async () => {
    // Arrange
    const { ask } = setup(null);

    // Act
    const events = await ask();

    // Assert
    expect(types(events)).toEqual([EventType.RUN_STARTED, EventType.RUN_ERROR]);
    expect(errorOf(events)?.message).toBe('The assistant is not configured');
  });

  it("streams Gemini's answer, loading Firebase with App Check on the first question only", async () => {
    // Arrange
    const { ask } = setup();
    firebase.generateContentStream.mockImplementation(async () => ({
      stream: stream('Hel', 'lo'),
    }));

    // Act
    const first = await ask();
    const second = await ask();

    // Assert
    expect(types(first)).toEqual([
      EventType.RUN_STARTED,
      EventType.TEXT_MESSAGE_START,
      EventType.TEXT_MESSAGE_CONTENT,
      EventType.TEXT_MESSAGE_CONTENT,
      EventType.TEXT_MESSAGE_END,
      EventType.RUN_FINISHED,
    ]);
    expect(types(second)).toEqual(types(first));
    expect(firebase.initializeApp).toHaveBeenCalledOnce();
    expect(firebase.initializeApp).toHaveBeenCalledWith(
      CONFIG.firebase,
      'cv-assistant'
    );
    expect(firebase.initializeAppCheck).toHaveBeenCalledWith(
      { name: 'cv-assistant' },
      expect.objectContaining({ isTokenAutoRefreshEnabled: true })
    );
    expect(firebase.getGenerativeModel).toHaveBeenCalledWith(
      expect.anything(),
      { model: 'gemini-test' }
    );
    expect(
      (globalThis as { FIREBASE_APPCHECK_DEBUG_TOKEN?: unknown })
        .FIREBASE_APPCHECK_DEBUG_TOKEN
    ).toBeUndefined();
  });

  it('reuses its Firebase app and sets the App Check debug token for local development', async () => {
    // Arrange
    firebase.apps = [{ name: 'other' }, { name: 'cv-assistant' }];
    const { ask } = setup({ ...CONFIG, appCheckDebugToken: 'debug-token' });
    firebase.generateContentStream.mockImplementation(async () => ({
      stream: stream('Hi'),
    }));

    // Act
    await ask();

    // Assert
    expect(firebase.initializeApp).not.toHaveBeenCalled();
    expect(
      (globalThis as { FIREBASE_APPCHECK_DEBUG_TOKEN?: unknown })
        .FIREBASE_APPCHECK_DEBUG_TOKEN
    ).toBe('debug-token');
  });

  it('tries to load Firebase again on the next question after it failed', async () => {
    // Arrange
    const { ask } = setup();
    firebase.getGenerativeModel.mockImplementationOnce(() => {
      throw new Error('Firebase failed to load');
    });
    firebase.generateContentStream.mockImplementation(async () => ({
      stream: stream('Hi'),
    }));

    // Act
    const failed = await ask();
    const retried = await ask();

    // Assert
    expect(errorOf(failed)?.message).toBe('Firebase failed to load');
    expect(types(retried)).toContain(EventType.RUN_FINISHED);
    expect(firebase.getGenerativeModel).toHaveBeenCalledTimes(2);
  });

  it('says the quota ran out instead of offering a retry', async () => {
    // Arrange
    const { ask } = setup();
    firebase.generateContentStream.mockRejectedValue(
      new Error('[429] RESOURCE_EXHAUSTED')
    );

    // Act
    const events = await ask();

    // Assert
    expect(errorOf(events)).toEqual({
      type: EventType.RUN_ERROR,
      message: ASSISTANT_QUOTA_EXCEEDED,
      code: 'quota_exceeded',
    });
  });

  it('reports a failure that is not an Error as text', async () => {
    // Arrange
    const { ask } = setup();
    firebase.generateContentStream.mockRejectedValue('offline');

    // Act
    const events = await ask();

    // Assert
    expect(errorOf(events)?.message).toBe('offline');
  });

  it('stays quiet when the visitor stopped the run', async () => {
    // Arrange
    const { ask } = setup();
    const controller = new AbortController();
    firebase.generateContentStream.mockImplementation(
      (_request: unknown, { signal }: { signal: AbortSignal }) =>
        new Promise((_, reject) =>
          signal.addEventListener('abort', () => reject(signal.reason))
        )
    );

    // Act
    const run = ask(controller.signal);
    await vi.waitFor(() =>
      expect(firebase.generateContentStream).toHaveBeenCalled()
    );
    controller.abort(new Error('stopped'));
    const events = await run;

    // Assert
    expect(types(events)).toEqual([EventType.RUN_STARTED]);
  });

  it('fails the run when the model does not start answering in time', async () => {
    // Arrange
    vi.useFakeTimers();
    const { ask } = setup();
    let requestSignal: AbortSignal | undefined;
    firebase.generateContentStream.mockImplementation(
      (_request: unknown, { signal }: { signal: AbortSignal }) => {
        requestSignal = signal;
        return new Promise(() => undefined);
      }
    );

    // Act: once the request went out (Firebase loads first)
    const run = ask();
    await vi.waitFor(() => expect(requestSignal).toBeDefined());
    await vi.advanceTimersByTimeAsync(RESPONSE_START_TIMEOUT_MS);
    const events = await run;

    // Assert
    expect(errorOf(events)?.message).toBe(
      'The model did not start answering in time'
    );
    expect(requestSignal?.aborted).toBe(true);
  });
});

describe('isQuotaError', () => {
  it('recognises Gemini running out of its quota', () => {
    // Arrange
    const sdkError = Object.assign(
      new Error('[429 ] You exceeded your quota'),
      {
        customErrorData: { status: 429 },
      }
    );

    // Act & Assert
    expect(isQuotaError(sdkError)).toBe(true);
    expect(isQuotaError(new Error('RESOURCE_EXHAUSTED'))).toBe(true);
  });

  it('leaves other errors alone', () => {
    expect(isQuotaError(new Error('Network error'))).toBe(false);
    expect(isQuotaError('429')).toBe(false);
  });
});
