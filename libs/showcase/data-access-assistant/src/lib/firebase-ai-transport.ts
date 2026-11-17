import { inject, Service } from '@angular/core';
import { EventType, type AGUIEvent } from '@ag-ui/core';
import type {
  Transport,
  TransportRequest,
  TransportResponse,
} from '@hashbrownai/core';
import type { GenerativeModel } from 'firebase/ai';
import { ASSISTANT_CONFIG, type AssistantConfig } from './assistant-config';
import {
  toGeminiRequest,
  type HashbrownRunInput,
} from './internal/transport/gemini-request';
import { toAgUiEvents } from './internal/transport/gemini-events';

/** Its own Firebase app name, so it never collides with another one */
const FIREBASE_APP_NAME = 'cv-assistant';

/**
 * Loads the Firebase SDK on the first question only, never with the page:
 * App Check (reCAPTCHA Enterprise) and Firebase AI Logic.
 */
async function createModel(config: AssistantConfig): Promise<GenerativeModel> {
  const [app, ai, appCheck] = await Promise.all([
    import('firebase/app'),
    import('firebase/ai'),
    import('firebase/app-check'),
  ]);
  const firebaseApp =
    app.getApps().find(({ name }) => name === FIREBASE_APP_NAME) ??
    app.initializeApp(config.firebase, FIREBASE_APP_NAME);

  if (config.appCheckDebugToken) {
    (
      globalThis as { FIREBASE_APPCHECK_DEBUG_TOKEN?: string | true }
    ).FIREBASE_APPCHECK_DEBUG_TOKEN = config.appCheckDebugToken;
  }
  appCheck.initializeAppCheck(firebaseApp, {
    provider: new appCheck.ReCaptchaEnterpriseProvider(config.recaptchaSiteKey),
    isTokenAutoRefreshEnabled: true,
  });

  return ai.getGenerativeModel(
    ai.getAI(firebaseApp, { backend: new ai.GoogleAIBackend() }),
    { model: config.model }
  );
}

/**
 * The error message of a run that failed on the free tier's quota (e.g. the
 * requests per day), so the page can say so instead of offering a retry
 */
export const ASSISTANT_QUOTA_EXCEEDED = 'ASSISTANT_QUOTA_EXCEEDED';

/** Gemini's `429 RESOURCE_EXHAUSTED`, as the Firebase AI SDK reports it */
export function isQuotaError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const status = (error as { customErrorData?: { status?: number } })
    .customErrorData?.status;
  return (
    status === 429 || /\b429\b|RESOURCE_EXHAUSTED|quota/i.test(error.message)
  );
}

/** How long the model may take to start answering before the run fails */
export const RESPONSE_START_TIMEOUT_MS = 60_000;

/**
 * Starts a request that is cancelled with `signal` (the visitor stops), or
 * when no response has started after {@link RESPONSE_START_TIMEOUT_MS}: then
 * it fails, so the chat offers to try again instead of waiting forever.
 */
async function withStartTimeout<T>(
  signal: AbortSignal,
  start: (requestSignal: AbortSignal) => Promise<T>
): Promise<T> {
  const controller = new AbortController();
  const stop = () => controller.abort(signal.reason);
  signal.addEventListener('abort', stop, { once: true });
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error('The model did not start answering in time'));
    }, RESPONSE_START_TIMEOUT_MS);
  });
  try {
    return await Promise.race([start(controller.signal), timeout]);
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', stop);
  }
}

/**
 * Hashbrown transport that talks to Gemini through Firebase AI Logic, straight
 * from the browser: no backend needed on the Spark plan, and no API key in the
 * bundle (App Check proves the requests come from this site).
 */
@Service()
export class FirebaseAiTransport implements Transport {
  readonly name = 'firebase-ai-logic';
  private readonly _config = inject(ASSISTANT_CONFIG);
  private _model?: Promise<GenerativeModel>;

  async send({ input, signal }: TransportRequest): Promise<TransportResponse> {
    return { events: this._run(input, signal) };
  }

  private async *_run(
    input: HashbrownRunInput,
    signal: AbortSignal
  ): AsyncGenerator<AGUIEvent> {
    const { threadId, runId } = input;
    yield { type: EventType.RUN_STARTED, threadId, runId };
    try {
      const config = this._config;
      if (!config) throw new Error('The assistant is not configured');
      this._model ??= createModel(config).catch((error: unknown) => {
        this._model = undefined;
        throw error;
      });
      const model = await this._model;
      const stream = await withStartTimeout(signal, (requestSignal) =>
        model
          .generateContentStream(toGeminiRequest(input), {
            signal: requestSignal,
          })
          .then((result) => result.stream)
      );
      yield* toAgUiEvents(stream, {
        threadId,
        runId,
        model: config.model,
        signal,
      });
    } catch (error) {
      if (!signal.aborted) {
        yield isQuotaError(error)
          ? {
              type: EventType.RUN_ERROR,
              message: ASSISTANT_QUOTA_EXCEEDED,
              code: 'quota_exceeded',
            }
          : {
              type: EventType.RUN_ERROR,
              message: error instanceof Error ? error.message : String(error),
            };
      }
    }
  }
}
