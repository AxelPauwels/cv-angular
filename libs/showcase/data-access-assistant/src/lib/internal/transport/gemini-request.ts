import type { Message, RunAgentInput, Tool } from '@ag-ui/core';
import type { Content, GenerateContentRequest, Part } from 'firebase/ai';

/** Hashbrown's extras on the AG-UI run input */
export type HashbrownRunInput = RunAgentInput & {
  forwardedProps?: { hashbrown?: { responseSchema?: object } };
};

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

/** Gemini wants a JSON object as function response */
function toResponseObject(content: unknown): object {
  const parsed = typeof content === 'string' ? parseJson(content) : content;
  return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
    ? parsed
    : { result: parsed };
}

function textOf(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((part) =>
        part && typeof part === 'object' && 'text' in part
          ? String(part.text)
          : ''
      )
      .join('');
  }
  return '';
}

function findToolName(messages: Message[], toolCallId: string): string {
  for (const message of messages) {
    if (message.role !== 'assistant') continue;
    const call = message.toolCalls?.find(({ id }) => id === toolCallId);
    if (call) return call.function.name;
  }
  return 'unknown';
}

function toContent(message: Message, messages: Message[]): Content | null {
  switch (message.role) {
    case 'user':
      return {
        role: 'user',
        parts: [{ type: 'text', text: textOf(message.content) }],
      };
    case 'assistant': {
      const parts: Part[] = [];
      if (message.content) parts.push({ type: 'text', text: message.content });
      for (const call of message.toolCalls ?? []) {
        parts.push({
          type: 'functionCall',
          functionCall: {
            id: call.id,
            name: call.function.name,
            args: toResponseObject(call.function.arguments),
          },
          // Gemini 3+ rejects a function call history without its signature
          ...(call.encryptedValue
            ? { thoughtSignature: call.encryptedValue }
            : {}),
        } as Part);
      }
      return parts.length ? { role: 'model', parts } : null;
    }
    case 'tool':
      return {
        role: 'user',
        parts: [
          {
            type: 'functionResponse',
            functionResponse: {
              id: message.toolCallId,
              name: findToolName(messages, message.toolCallId),
              response:
                message.error === undefined
                  ? toResponseObject(message.content)
                  : { error: message.error },
            },
          } as Part,
        ],
      };
    default:
      // system and developer go to systemInstruction; reasoning and activity stay local
      return null;
  }
}

/** Gemini expects alternating turns: parallel tool results share one turn */
function mergeTurns(contents: Content[]): Content[] {
  return contents.reduce<Content[]>((merged, content) => {
    const previous = merged.at(-1);
    if (previous?.role === content.role) {
      previous.parts = [...previous.parts, ...content.parts];
    } else {
      merged.push({ ...content, parts: [...content.parts] });
    }
    return merged;
  }, []);
}

function toFunctionDeclaration(tool: Tool) {
  // Hashbrown sends JSON Schema; the Developer API takes it as-is
  return {
    name: tool.name,
    description: tool.description,
    ...(tool.parameters ? { parametersJsonSchema: tool.parameters } : {}),
  };
}

/** Maps Hashbrown's AG-UI run input onto a Gemini request */
export function toGeminiRequest(
  input: HashbrownRunInput
): GenerateContentRequest {
  const system = input.messages
    .filter(({ role }) => role === 'system' || role === 'developer')
    .map((message): Part => ({ type: 'text', text: textOf(message.content) }));
  const contents = mergeTurns(
    input.messages
      .map((message) => toContent(message, input.messages))
      .filter((content): content is Content => content !== null)
  );
  const responseSchema = input.forwardedProps?.hashbrown?.responseSchema;
  const tools = input.tools ?? [];

  return {
    contents,
    ...(system.length
      ? { systemInstruction: { role: 'system', parts: system } }
      : {}),
    ...(tools.length
      ? {
          tools: [
            { functionDeclarations: tools.map(toFunctionDeclaration) },
          ] as GenerateContentRequest['tools'],
        }
      : {}),
    ...(responseSchema
      ? {
          generationConfig: {
            responseMimeType: 'application/json',
            responseJsonSchema: responseSchema as Record<string, unknown>,
          },
        }
      : {}),
  };
}
