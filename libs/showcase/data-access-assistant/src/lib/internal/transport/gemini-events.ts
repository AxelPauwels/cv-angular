import { EventType, type AGUIEvent } from '@ag-ui/core';
import {
  ɵcreateRunFinishedEvent,
  ɵcreateTokenUsage,
  type FinishReason,
} from '@hashbrownai/core';
import type { GenerateContentResponse, Part } from 'firebase/ai';

/** Gemini's finish reasons in AG-UI's (Hashbrown's) words */
function toFinishReason(reason: string | undefined): FinishReason {
  switch (reason) {
    case undefined:
    case 'STOP':
      return 'stop';
    case 'MAX_TOKENS':
      return 'length';
    case 'SAFETY':
    case 'BLOCKLIST':
    case 'PROHIBITED_CONTENT':
    case 'SPII':
    case 'RECITATION':
      return 'content_filter';
    default:
      return 'other';
  }
}

/** Parts carry Gemini's thought signature, which the SDK types leave out */
type SignedPart = Part & { thoughtSignature?: string; thought?: boolean };

export interface GeminiEventOptions {
  threadId: string;
  runId: string;
  model: string;
  signal?: AbortSignal;
}

/**
 * Turns Gemini's streamed chunks into the AG-UI events Hashbrown consumes:
 * one run, its text message and the function calls the browser should run.
 * Thinking stays private; only the signatures of function calls are kept,
 * since Gemini wants them back on the next turn.
 */
export async function* toAgUiEvents(
  chunks: AsyncIterable<GenerateContentResponse>,
  { threadId, runId, model, signal }: GeminiEventOptions
): AsyncGenerator<AGUIEvent> {
  const messageId = `${runId}:assistant`;
  let textStarted = false;
  let calledTools = false;
  let toolCallIndex = 0;
  let finishReason: string | undefined;
  let usage: GenerateContentResponse['usageMetadata'];

  for await (const chunk of chunks) {
    if (signal?.aborted) return;
    const candidate = chunk.candidates?.[0];
    finishReason = candidate?.finishReason ?? finishReason;
    usage = chunk.usageMetadata ?? usage;

    for (const part of (candidate?.content?.parts ?? []) as SignedPart[]) {
      if (part.thought) continue;

      if ('functionCall' in part && part.functionCall) {
        calledTools = true;
        const toolCallId =
          part.functionCall.id ?? `${messageId}:tool:${toolCallIndex}`;
        toolCallIndex += 1;
        yield {
          type: EventType.TOOL_CALL_START,
          toolCallId,
          toolCallName: part.functionCall.name,
          parentMessageId: messageId,
        };
        yield {
          type: EventType.TOOL_CALL_ARGS,
          toolCallId,
          delta: JSON.stringify(part.functionCall.args ?? {}),
        };
        if (part.thoughtSignature) {
          yield {
            type: EventType.REASONING_ENCRYPTED_VALUE,
            subtype: 'tool-call',
            entityId: toolCallId,
            encryptedValue: part.thoughtSignature,
          };
        }
        yield { type: EventType.TOOL_CALL_END, toolCallId };
        continue;
      }

      if ('text' in part && part.text) {
        if (!textStarted) {
          textStarted = true;
          yield {
            type: EventType.TEXT_MESSAGE_START,
            messageId,
            role: 'assistant',
          };
        }
        yield {
          type: EventType.TEXT_MESSAGE_CONTENT,
          messageId,
          delta: part.text,
        };
      }
    }
  }

  if (signal?.aborted) return;
  if (textStarted) yield { type: EventType.TEXT_MESSAGE_END, messageId };

  yield ɵcreateRunFinishedEvent({
    threadId,
    runId,
    provider: 'google',
    finishReason: calledTools ? 'tool_calls' : toFinishReason(finishReason),
    usage: ɵcreateTokenUsage({
      provider: 'google',
      model,
      inputTokens: usage?.promptTokenCount,
      outputTokens: usage?.candidatesTokenCount,
      totalTokens: usage?.totalTokenCount,
      reasoningTokens: usage?.thoughtsTokenCount,
    }),
  });
}
