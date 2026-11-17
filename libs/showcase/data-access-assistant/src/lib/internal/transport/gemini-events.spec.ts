import { EventType, type AGUIEvent } from '@ag-ui/core';
import type { GenerateContentResponse } from 'firebase/ai';
import { toAgUiEvents } from './gemini-events';

async function* stream(
  ...chunks: GenerateContentResponse[]
): AsyncGenerator<GenerateContentResponse> {
  yield* chunks;
}

async function collect(
  chunks: AsyncIterable<GenerateContentResponse>
): Promise<AGUIEvent[]> {
  const events: AGUIEvent[] = [];
  for await (const event of toAgUiEvents(chunks, {
    threadId: 'thread',
    runId: 'run',
    model: 'gemini-test',
  })) {
    events.push(event);
  }
  return events;
}

const chunk = (
  parts: object[],
  finishReason?: string
): GenerateContentResponse =>
  ({
    candidates: [{ index: 0, content: { role: 'model', parts }, finishReason }],
  }) as unknown as GenerateContentResponse;

describe('toAgUiEvents', () => {
  it('streams text as one assistant message and finishes the run', async () => {
    // Arrange
    const chunks = stream(
      chunk([{ text: 'Hel' }]),
      chunk([{ text: 'lo' }], 'STOP')
    );

    // Act
    const events = await collect(chunks);

    // Assert
    expect(events.map(({ type }) => type)).toEqual([
      EventType.TEXT_MESSAGE_START,
      EventType.TEXT_MESSAGE_CONTENT,
      EventType.TEXT_MESSAGE_CONTENT,
      EventType.TEXT_MESSAGE_END,
      EventType.RUN_FINISHED,
    ]);
  });

  it('turns a function call into tool call events and keeps its signature', async () => {
    // Arrange
    const chunks = stream(
      chunk([
        { thought: true, text: 'Let me look' },
        {
          functionCall: { id: 'c1', name: 'getReferences', args: {} },
          thoughtSignature: 'signature',
        },
      ])
    );

    // Act
    const events = await collect(chunks);

    // Assert
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: EventType.TOOL_CALL_START,
          toolCallId: 'c1',
          toolCallName: 'getReferences',
        }),
        expect.objectContaining({
          type: EventType.REASONING_ENCRYPTED_VALUE,
          entityId: 'c1',
          encryptedValue: 'signature',
        }),
      ])
    );
    expect(
      events.some(({ type }) => type === EventType.TEXT_MESSAGE_START)
    ).toBe(false);
    expect(events.at(-1)?.type).toBe(EventType.RUN_FINISHED);
  });
});
