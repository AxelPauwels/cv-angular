# Firebase console and Google Cloud setup

What the AI assistant (`/showcase/ai-assistant`) needs outside the code: Firebase AI Logic, App Check with reCAPTCHA, the keys, and their restrictions. The code side is in [`libs/showcase/data-access-assistant`](libs/showcase/data-access-assistant/README.md).

Everything runs on the free **Spark** plan: the browser calls Gemini through Firebase AI Logic, so there is no backend and no Gemini key in the bundle.

## TL;DR

1. Firebase: register a web app, enable **AI Logic** with the **Gemini Developer API**.
2. Google Cloud **Fraud Defense**: create a score-based **Web** reCAPTCHA key for the live domains, and register it in **App Check**.
3. Put the keys in the gitignored tokens file (local) and in three **GitHub secrets** (CI).
4. Restrict the browser API key to the site's domains and the two Firebase APIs.
5. Local development: register one **App Check debug token** and put it in the tokens file.

Visitors never need a token: on the deployed site App Check uses reCAPTCHA invisibly, in every browser.

## Links

| What                      | Where                                                                                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| AI Logic                  | [console.firebase.google.com/project/axel-pauwels/ailogic](https://console.firebase.google.com/project/axel-pauwels/ailogic)                   |
| App Check                 | [console.firebase.google.com/project/axel-pauwels/appcheck](https://console.firebase.google.com/project/axel-pauwels/appcheck)                 |
| Project settings (apps)   | [console.firebase.google.com/project/axel-pauwels/settings/general](https://console.firebase.google.com/project/axel-pauwels/settings/general) |
| API keys                  | [console.cloud.google.com/apis/credentials?project=axel-pauwels](https://console.cloud.google.com/apis/credentials?project=axel-pauwels)       |
| reCAPTCHA (Fraud Defense) | Google Cloud console, search for **Fraud Defense** (project axel-pauwels)                                                                      |
| Gemini usage and limits   | [ai.dev/rate-limit](https://ai.dev/rate-limit)                                                                                                 |

## 1. Web app and AI Logic

1. **Project settings → Your apps → Add app → Web.** Of the config it shows, the assistant needs `apiKey` and `appId` (`projectId` and `authDomain` are in the environment files). Skip the npm/`getAnalytics` snippet: the code initializes Firebase itself, and Analytics is not used.
2. **AI Logic → Get started → Gemini Developer API.** On Spark it uses the free tier. _AI monitoring_ is optional and not needed (it uses Cloud Observability, which may need Blaze).

The model is `model` in the environment files: `gemini-3.5-flash-lite`. `gemini-3.8-flash` allows only **20 requests a day** on the free tier, and one question takes about **2 requests** (one per tool round). Google retires models: check the [model list](https://firebase.google.com/docs/ai-logic/models).

## 2. App Check with reCAPTCHA

App Check is **required** for AI Logic (since 2 November 2026): it proves requests come from this site.

1. Google Cloud → **Fraud Defense** (the old reCAPTCHA page is deprecated) → create a key:
   - application type **Web**, **score-based**: leave the checkbox challenge off
   - domains: `axel-pauwels.web.app`, `axel-pauwels.firebaseapp.com`, a custom domain if any, and the preview channels (`axel-pauwels--*.web.app` if a wildcard is accepted, else each preview address to test). Not `localhost`: see the debug token below.
2. Copy the key ID (`6L…`): that is the **site key**.
3. **App Check → Apps → Web → reCAPTCHA Enterprise** → paste the site key → Save.

## 3. Keys: tokens file and GitHub secrets

The keys are public by design (they end up in the bundle; App Check guards their use), but they stay out of the repo like the Web3Forms key, so secret scanners don't flag the `AIza…` key.

| Value                 | Local: `apps/cv/src/tokens/environment.tokens.ts` | CI: GitHub secret    |
| --------------------- | ------------------------------------------------- | -------------------- |
| Web app `apiKey`      | `FIREBASE_ASSISTANT.API_KEY`                      | `FIREBASE_API_KEY`   |
| Web app `appId`       | `FIREBASE_ASSISTANT.APP_ID`                       | `FIREBASE_APP_ID`    |
| reCAPTCHA site key    | `FIREBASE_ASSISTANT.RECAPTCHA_SITE_KEY`           | `RECAPTCHA_SITE_KEY` |
| App Check debug token | `FIREBASE_ASSISTANT.APP_CHECK_DEBUG_TOKEN`        | never in CI          |

The tokens file is gitignored; copy the `FIREBASE_ASSISTANT` export from `environment.tokens.example.ts`. In CI, `scripts/build-production.sh` runs `scripts/set-assistant-keys.mjs`, which writes the secrets into the tokens file. The build log then says _"🤖 Adding the AI assistant's Firebase keys..."_; _"⚠️ … switched off"_ means the secrets are missing or don't look like keys. With any value empty, the page says the assistant is switched off.

```bash
# set the secrets (the value comes from stdin, not the command line)
printf '%s' '<apiKey>' | gh secret set FIREBASE_API_KEY
printf '%s' '<appId>' | gh secret set FIREBASE_APP_ID
printf '%s' '<site key>' | gh secret set RECAPTCHA_SITE_KEY
```

## 4. Restrict the browser API key

Google warns about unrestricted keys once the Gemini API is on. **APIs & Services → Credentials**:

- **Browser key** (`AIza…`, the web app's key) → Edit:
  - **Application restrictions → Websites**: `https://axel-pauwels.web.app/*`, `https://axel-pauwels.firebaseapp.com/*`, a custom domain, the preview channels, and `http://localhost:4201/*`
  - **API restrictions → Restrict key**: at least **Firebase AI Logic API** and **Firebase App Check API** (keep other Firebase APIs it already lists)
- **The Gemini key Firebase AI Logic created** (if listed): Firebase's proxy uses it server side. Restrict it to the **Gemini API (Generative Language API)** only, without a website restriction. If the assistant stops working after this, undo it first.

The warning banner can stay for up to 24 hours after the fix.

## 5. Local development: one debug token

On `localhost` reCAPTCHA can't vouch for the site, so App Check uses a **debug token** instead (`appCheckDebugToken` in `environment.development.ts`).

- With `APP_CHECK_DEBUG_TOKEN` set in the tokens file, every local browser uses that one token: register it once.
- Empty, each browser makes its own and prints it in the console on the first question (`Firebase App Check debug token: …`), and each needs registering.

Register a token in **App Check → Apps → Web → ⋮ → Manage debug tokens**, or:

```bash
npx firebase appcheck:debugtokens:create <token> --project axel-pauwels --app <appId>
```

The token is printed again in the console, or read it from the browser (DevTools console):

```js
indexedDB.open('firebase-app-check-database').onsuccess = (e) => (e.target.result.transaction('firebase-app-check-store').objectStore('firebase-app-check-store').get('debug-token').onsuccess = (r) => console.log('DEBUG TOKEN:', r.target.result?.value));
```

A debug token gets past App Check: keep it out of the repo, never put it in CI, and delete tokens you no longer use.

## Caching after a deploy

`firebase.json` sends `Cache-Control: no-cache` for everything except JS, CSS, fonts and images: the HTML and the federation files (`remoteEntry.json`, `importmap.json`, `federation.manifest.json`) are revalidated on every visit (cheap, with ETags); the hashed JS and CSS stay cached for a year. Before this, these files were cached for an hour each, so a visitor right after a deploy could combine an old import map with new code: _"Unable to resolve specifier '@hashbrownai/angular'"_ until the cache expired.

## Troubleshooting

| Console shows                                          | Cause and fix                                                                                                             |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| The page says the assistant is switched off            | A key is empty: the tokens file locally, the GitHub secrets in CI                                                         |
| `403` on `exchangeDebugToken` (localhost)              | This browser's debug token isn't registered: section 5                                                                    |
| `403` on `exchangeRecaptchaEnterpriseToken` (live)     | The domain is missing from the reCAPTCHA key: section 2                                                                   |
| `403` "referer blocked" / "API key not valid"          | The domain or API is missing from the browser key's restrictions: section 4                                               |
| `401` on `firebasevertexai.googleapis.com`             | No valid App Check token: see the App Check `403` above it                                                                |
| `429` on `firebasevertexai.googleapis.com`             | The free tier's limit (per model, per day); the page shows its "daily limit" message. Wait for the reset, or switch model |
| _"answering…"_, then after 60 s "Something went wrong" | Gemini didn't start answering in time; check `429`s and AI Logic in the console                                           |
| _"Unable to resolve specifier …"_ right after a deploy | An old cached import map: reload. `no-cache` in `firebase.json` prevents it (see Caching)                                 |
