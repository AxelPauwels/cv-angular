import type { HashbrownRunInput } from './gemini-request';
import { toGeminiRequest } from './gemini-request';

const base: HashbrownRunInput = {
  threadId: 'thread',
  runId: 'run',
  state: {},
  messages: [],
  tools: [],
  context: [],
  forwardedProps: {},
};

describe('toGeminiRequest', () => {
  it('sends the system messages as system instruction, not as turns', () => {
    // Arrange
    const input: HashbrownRunInput = {
      ...base,
      messages: [
        { id: 's', role: 'system', content: 'Be brief' },
        { id: 'u', role: 'user', content: 'Hi' },
      ],
    };

    // Act
    const request = toGeminiRequest(input);

    // Assert
    expect(request.systemInstruction).toEqual({
      role: 'system',
      parts: [{ type: 'text', text: 'Be brief' }],
    });
    expect(request.contents).toEqual([
      { role: 'user', parts: [{ type: 'text', text: 'Hi' }] },
    ]);
  });

  it('round-trips function calls with their thought signature and merges parallel results', () => {
    // Arrange
    const input: HashbrownRunInput = {
      ...base,
      messages: [
        { id: 'u', role: 'user', content: 'References?' },
        {
          id: 'a',
          role: 'assistant',
          toolCalls: [
            {
              id: 'c1',
              type: 'function',
              function: { name: 'getReferences', arguments: '{}' },
              encryptedValue: 'signature',
            },
            {
              id: 'c2',
              type: 'function',
              function: { name: 'getExperiences', arguments: '{}' },
            },
          ],
        },
        {
          id: 't1',
          role: 'tool',
          toolCallId: 'c1',
          content: '[{"name":"Roel"}]',
        },
        { id: 't2', role: 'tool', toolCallId: 'c2', content: '{"ok":true}' },
      ],
    };

    // Act
    const { contents } = toGeminiRequest(input);

    // Assert
    expect(contents).toHaveLength(3);
    expect(contents[1].parts[0]).toMatchObject({
      functionCall: { id: 'c1', name: 'getReferences', args: {} },
      thoughtSignature: 'signature',
    });
    expect(contents[1].parts[1]).not.toHaveProperty('thoughtSignature');
    expect(contents[2]).toEqual({
      role: 'user',
      parts: [
        {
          type: 'functionResponse',
          functionResponse: {
            id: 'c1',
            name: 'getReferences',
            response: { result: [{ name: 'Roel' }] },
          },
        },
        {
          type: 'functionResponse',
          functionResponse: {
            id: 'c2',
            name: 'getExperiences',
            response: { ok: true },
          },
        },
      ],
    });
  });

  it('passes tools and the UI response schema as JSON Schema', () => {
    // Arrange
    const schema = { type: 'object', properties: {} };
    const input: HashbrownRunInput = {
      ...base,
      messages: [{ id: 'u', role: 'user', content: 'Hi' }],
      tools: [{ name: 'getSkills', description: 'Skills', parameters: schema }],
      forwardedProps: { hashbrown: { responseSchema: schema } },
    };

    // Act
    const request = toGeminiRequest(input);

    // Assert
    expect(request.tools).toEqual([
      {
        functionDeclarations: [
          {
            name: 'getSkills',
            description: 'Skills',
            parametersJsonSchema: schema,
          },
        ],
      },
    ]);
    expect(request.generationConfig).toEqual({
      responseMimeType: 'application/json',
      responseJsonSchema: schema,
    });
  });
});
