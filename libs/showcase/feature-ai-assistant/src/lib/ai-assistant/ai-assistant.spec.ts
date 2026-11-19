import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { EventType, type AGUIEvent } from '@ag-ui/core';
import type {
  Transport,
  TransportRequest,
  TransportResponse,
} from '@hashbrownai/core';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import {
  ASSISTANT_QUOTA_EXCEEDED,
  CvKnowledgeService,
  FirebaseAiTransport,
  provideAssistantConfig,
} from '@cv/showcase-data-access-assistant';
import {
  AiAssistant,
  MAX_QUESTIONS,
  withoutInvisibleCharacters,
} from './ai-assistant';

/** One run of the model: what it answers, given the request */
type Run = (request: TransportRequest) => AsyncGenerator<AGUIEvent>;

/** Answers each question with the next scripted run, instead of Gemini */
class FakeTransport implements Transport {
  readonly name = 'fake';
  readonly runs: Run[] = [];
  readonly requests: TransportRequest[] = [];

  async send(request: TransportRequest): Promise<TransportResponse> {
    this.requests.push(request);
    const run = this.runs.shift() ?? finished;
    return { events: run(request) };
  }
}

function started({ input }: TransportRequest): AGUIEvent {
  const { threadId, runId } = input as { threadId: string; runId: string };
  return { type: EventType.RUN_STARTED, threadId, runId };
}

/** A run that ends without an answer */
async function* finished(request: TransportRequest): AsyncGenerator<AGUIEvent> {
  const { threadId, runId } = request.input as {
    threadId: string;
    runId: string;
  };
  yield started(request);
  yield { type: EventType.RUN_FINISHED, threadId, runId };
}

/** A run that fails with `message` */
const failing = (message: string): Run =>
  async function* (request) {
    yield started(request);
    yield { type: EventType.RUN_ERROR, message };
  };

/** A run in which the model reads the references through a tool */
async function* readsReferences(
  request: TransportRequest
): AsyncGenerator<AGUIEvent> {
  const { threadId, runId } = request.input as {
    threadId: string;
    runId: string;
  };
  const toolCallId = 'call-1';
  yield started(request);
  yield {
    type: EventType.TOOL_CALL_START,
    toolCallId,
    toolCallName: 'getReferences',
    parentMessageId: `${runId}:assistant`,
  };
  yield { type: EventType.TOOL_CALL_ARGS, toolCallId, delta: '{}' };
  yield { type: EventType.TOOL_CALL_END, toolCallId };
  yield { type: EventType.RUN_FINISHED, threadId, runId };
}

/** A run that only ends when the visitor stops it */
async function* endless(request: TransportRequest): AsyncGenerator<AGUIEvent> {
  yield started(request);
  await new Promise((resolve) =>
    request.signal.addEventListener('abort', resolve, { once: true })
  );
}

async function render(configured: boolean) {
  const transport = new FakeTransport();
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideI18nTesting(),
      provideAssistantConfig(
        configured
          ? {
              firebase: { apiKey: 'key', projectId: 'project', appId: 'app' },
              recaptchaSiteKey: 'site-key',
              model: 'gemini-test',
            }
          : null
      ),
      { provide: FirebaseAiTransport, useValue: transport },
      {
        provide: CvKnowledgeService,
        useValue: { references: async () => [{ name: 'Ada' }] },
      },
    ],
  });
  const fixture = TestBed.createComponent(AiAssistant);
  await fixture.whenStable();
  const element: HTMLElement = fixture.nativeElement;

  const field = () =>
    element.querySelector<HTMLTextAreaElement>(
      'textarea'
    ) as HTMLTextAreaElement;
  const button = (text: string) =>
    Array.from(element.querySelectorAll('button')).find((candidate) =>
      candidate.textContent?.includes(text)
    );
  /** Hashbrown debounces sending a little: let the run go out and render */
  const settle = async () => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    await fixture.whenStable();
  };
  /** Types a question and presses Enter */
  const ask = async (text: string, init: KeyboardEventInit = {}) => {
    field().value = text;
    field().dispatchEvent(new Event('input'));
    await fixture.whenStable();
    field().dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', cancelable: true, ...init })
    );
    await settle();
  };
  const userMessages = () =>
    Array.from(
      element.querySelectorAll(
        '.ai-assistant__message--user .ai-assistant__bubble'
      ),
      (bubble) => bubble.textContent?.trim()
    );
  const alert = () =>
    element.querySelector('[role="alert"]')?.textContent?.trim() ?? '';

  return {
    fixture,
    element,
    transport,
    field,
    button,
    settle,
    ask,
    userMessages,
    alert,
  };
}

describe('AiAssistant', () => {
  it('says it is switched off without a config, and offers no form', async () => {
    // Act
    const { element } = await render(false);

    // Assert
    expect(element.textContent).toContain('switched off');
    expect(element.querySelector('form')).toBeNull();
  });

  it('offers suggestions and a labelled question field', async () => {
    // Act
    const { element } = await render(true);
    const field = element.querySelector('textarea');
    const label = element.querySelector(`label[for="${field?.id}"]`);

    // Assert
    expect(
      element.querySelectorAll('.ai-assistant__suggestions button')
    ).toHaveLength(3);
    expect(label?.textContent?.trim()).toBe('Your question');
    expect(field?.maxLength).toBe(500);
    expect(element.querySelector('[role="log"]')).not.toBeNull();
  });

  it('keeps the send button disabled while the question is empty', async () => {
    // Act
    const { element } = await render(true);
    const send = element.querySelector<HTMLButtonElement>(
      'button[type="submit"]'
    );

    // Assert
    expect(send?.disabled).toBe(true);
  });

  it('asks a suggested question', async () => {
    // Arrange
    const { element, settle, userMessages, transport } = await render(true);
    const suggestion = element.querySelector<HTMLButtonElement>(
      '.ai-assistant__suggestions button'
    );

    // Act
    suggestion?.click();
    await settle();

    // Assert
    expect(transport.requests).toHaveLength(1);
    expect(userMessages()).toEqual([suggestion?.textContent?.trim()]);
    expect(element.querySelector('.ai-assistant__suggestions')).toBeNull();
  });

  it('sends with Enter, without invisible characters, and empties the field', async () => {
    // Arrange
    const { ask, field, userMessages } = await render(true);

    // Act
    await ask('  Where does Axel\u200B live?  ');

    // Assert
    expect(userMessages()).toEqual(['Where does Axel live?']);
    expect(field().value).toBe('');
  });

  it('starts a new line with Shift+Enter and sends nothing empty', async () => {
    // Arrange
    const { ask, transport, element } = await render(true);

    // Act
    await ask('Hello', { shiftKey: true });
    await ask('   ');
    element
      .querySelector('form')
      ?.dispatchEvent(new Event('submit', { cancelable: true }));

    // Assert
    expect(transport.requests).toHaveLength(0);
  });

  it('shows which part of the CV the assistant reads', async () => {
    // Arrange
    const { ask, transport, element, settle } = await render(true);
    transport.runs.push(readsReferences);

    // Act
    await ask('Who can give a reference?');
    await settle();

    // Assert: the tool's result went back to the model in a second run
    expect(transport.requests.length).toBeGreaterThanOrEqual(2);
    const tool = element.querySelector('.ai-assistant__tool');
    expect(tool?.textContent).toContain('Looked up the references');
    expect(tool?.querySelector('mat-icon')?.textContent).toBe('check');
    expect(
      element.querySelector('.ai-assistant__message--assistant')
    ).not.toBeNull();
  });

  it('can stop an answer that is still coming in', async () => {
    // Arrange
    const { ask, button, transport, settle, element } = await render(true);
    transport.runs.push(endless);
    await ask('A long question');
    expect(
      element.querySelector('[role="log"]')?.getAttribute('aria-busy')
    ).toBe('true');

    // Act: a question while busy is ignored, Stop ends the run
    await ask('Another one');
    button('Stop')?.click();
    await settle();

    // Assert
    expect(transport.requests).toHaveLength(1);
    expect(transport.requests[0].signal.aborted).toBe(true);
    expect(button('Stop')).toBeUndefined();
  });

  it('offers to try again when answering failed', async () => {
    // Arrange
    const { ask, button, transport, settle, alert } = await render(true);
    transport.runs.push(failing('Network error'));
    await ask('Which languages does Axel speak?');
    expect(alert()).toContain('Something went wrong');

    // Act
    button('Try again')?.click();
    await settle();

    // Assert
    expect(transport.requests).toHaveLength(2);
    expect(alert()).toBe('');
  });

  it('stops asking once the free quota is used up', async () => {
    // Arrange
    const { ask, transport, field, alert } = await render(true);
    transport.runs.push(failing(ASSISTANT_QUOTA_EXCEEDED));

    // Act
    await ask('First question');
    await ask('Second question');

    // Assert
    expect(alert()).toContain('free limit for today');
    expect(field().disabled).toBe(true);
    expect(transport.requests).toHaveLength(1);
  });

  it(`stops taking questions after ${MAX_QUESTIONS} per visit`, async () => {
    // Arrange
    const { ask, transport, element } = await render(true);

    // Act
    for (let index = 0; index < MAX_QUESTIONS; index++) {
      await ask(`Question ${index + 1}`);
    }

    // Assert
    expect(transport.requests).toHaveLength(MAX_QUESTIONS);
    expect(element.querySelector('form')).toBeNull();
    expect(element.textContent).toContain('maximum number of questions');
  });

  it('follows new messages unless the visitor scrolled up', async () => {
    // Arrange
    const { ask, element } = await render(true);
    const conversation = element.querySelector<HTMLElement>(
      '.ai-assistant__conversation'
    ) as HTMLElement;
    conversation.style.height = '40px';
    conversation.style.overflow = 'auto';
    await ask('First question');
    await ask('Second question');
    expect(conversation.scrollTop).toBeGreaterThan(0);

    // Act
    conversation.scrollTop = 0;
    conversation.dispatchEvent(new Event('scroll'));
    await ask('Third question', { shiftKey: true });

    // Assert
    expect(conversation.scrollTop).toBe(0);
  });

  it('drops the invisible characters Tolgee hides in texts', () => {
    expect(withoutInvisibleCharacters('Hi\u200C\u200D\u200B\uFEFF?')).toBe(
      'Hi?'
    );
  });
});
