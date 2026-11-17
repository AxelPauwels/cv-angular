# showcase-feature-ai-assistant

The Showcase's AI assistant page (`/showcase/ai-assistant`): a chat about the
CV, based on chapter 13 of _Modern Angular_ (Agentic UI with Hashbrown).

- `uiChatResource` lets Gemini answer with **components**: markdown text and
  a `PersonCard` per reference (`internal/assistant-components.ts`).
- **Tools** read the CV from the GraphQL API through `CvKnowledgeService` and
  translate its keys to the active language (`internal/assistant-tools.ts`).
- The system prompt (`internal/system-prompt.ts`) keeps the model on topic,
  with few-shot examples for the smaller, free models.
- Guard rails for the free quota: questions of up to 500 characters and up to
  20 questions per visit.
- Hashbrown's development telemetry is off (`provideHashbrown({ telemetry: false })`).
  The `.npmrc` turns off the telemetry its postinstall would send.

The model and Firebase setup: see `showcase-data-access-assistant`.
