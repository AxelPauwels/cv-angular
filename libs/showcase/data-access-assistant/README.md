# showcase-data-access-assistant

Data access for the Showcase's AI assistant (`showcase-feature-ai-assistant`):

- `FirebaseAiTransport`: a [Hashbrown](https://hashbrown.dev) transport that
  talks to Gemini through **Firebase AI Logic** (Gemini Developer API), straight
  from the browser. It works on the free Spark plan with no backend, and no
  Gemini key ends up in the bundle. It maps Hashbrown's AG-UI runs to Gemini
  requests and Gemini's stream back to AG-UI events, including the thought
  signatures Gemini 3+ needs on function calls. The Firebase SDK (app, AI,
  App Check) loads only when a visitor asks the first question.
- `CvKnowledgeService`: the assistant's read-only view of the GraphQL API
  (operations in `src/lib/internal/operations`). Phone numbers, the address
  and personal details are never selected.
- `provideAssistantConfig()`: the config token for `app.config.ts`, kept free
  of Hashbrown and Firebase imports so the initial bundle stays the same.

```bash
npx nx run showcase-data-access-assistant:codegen   # after changing an operation
```

## Firebase setup (one time)

The keys live in the gitignored tokens file (`FIREBASE_ASSISTANT` in
`apps/cv/src/tokens/environment.tokens.ts`, see the example file), and in CI
in the GitHub secrets `FIREBASE_API_KEY`, `FIREBASE_APP_ID` and
`RECAPTCHA_SITE_KEY` (written in by `scripts/set-assistant-keys.mjs`). They are
public by design, but staying out of the repo keeps secret scanners quiet.
While any value is empty, the page says the assistant is switched off.

1. **Register a web app** in the Firebase console (Project settings > Your
   apps) and copy `apiKey` and `appId`. These values are public by design.
2. **Enable Firebase AI Logic** (Build > AI Logic > Get started) and choose the
   **Gemini Developer API**. On the Spark plan it uses the free tier.
3. **App Check is required** for AI Logic since 2 November 2026. Create a
   score-based **reCAPTCHA Enterprise** web key for your domain (no checkbox
   challenge), register the app with it in App Check, and put the site key in
   `recaptchaSiteKey`. Then enforce App Check for Firebase AI Logic.
4. **Local development**: `appCheckDebugToken: true` makes the SDK log a debug
   token in the browser console. Add it under App Check > Apps > Manage debug
   tokens.
5. Optional: restrict the web API key to your domains in Google Cloud
   (APIs & Services > Credentials).

The model is set in `model`: `gemini-3.5-flash-lite` (free tier, supports
function calling). `gemini-3.8-flash` allows only 20 requests a day on the
free tier, and each question takes about 2 requests (one per tool round). Check the
[model list](https://firebase.google.com/docs/ai-logic/models) when Google
retires models.
