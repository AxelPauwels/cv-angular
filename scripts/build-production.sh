#!/bin/bash
set -e

# The dev environment imports the gitignored Tolgee tokens; CI has no copy
TOKENS=apps/cv/src/tokens/environment.tokens.ts
[ -f "$TOKENS" ] || cp apps/cv/src/tokens/environment.tokens.example.ts "$TOKENS"

# The contact form's Web3Forms access key, from the WEB3FORMS_ACCESS_KEY secret.
# It ends up in the bundle (the browser sends it), but stays out of the repo
if [ -n "$WEB3FORMS_ACCESS_KEY" ]; then
  echo "✉️  Adding the Web3Forms access key..."
  node scripts/set-web3forms-key.mjs "$TOKENS"
else
  echo "⚠️  WEB3FORMS_ACCESS_KEY not set, the contact form cannot send"
fi

# The AI assistant's Firebase AI Logic keys, from the FIREBASE_API_KEY,
# FIREBASE_APP_ID and RECAPTCHA_SITE_KEY secrets. Public by design (they end up
# in the bundle, App Check guards their use), but they stay out of the repo
if [ -n "$FIREBASE_API_KEY" ]; then
  echo "🤖 Adding the AI assistant's Firebase keys..."
  node scripts/set-assistant-keys.mjs "$TOKENS"
else
  echo "⚠️  FIREBASE_API_KEY not set, the AI assistant is switched off"
fi

# The deploy workflows pass the TOLGEE_API_KEY secret, so production ships the
# latest translations; the key only talks to Tolgee and never enters the build
if [ -n "$TOLGEE_API_KEY" ]; then
  echo "🌍 Pulling translations from Tolgee..."
  npm run i18n:pull
else
  echo "⚠️  TOLGEE_API_KEY not set, building with the committed translations"
fi

# The coverage and e2e reports, the GraphQL docs, the build info and the project
# graph are copied into the build as assets (/coverage from coverage/all, /e2e-report,
# /graphql-docs, /build-info and /project-graph, see apps/cv/project.json),
# so generate them first.
# `nx serve` serves them as well once they exist (the showcase and technical tabs show them).

# Every project, merged into one report (coverage/all), so the coverage page
# shows what all the tests cover, not only the app's own tests
echo "🧪 Running unit tests with coverage..."
npx nx run-many -t test --all --configuration=ci --coverage
npm run coverage:merge

echo "🎭 Running e2e tests..."
# Every browser (empty E2E_BROWSERS), and the same task as `nx affected -t e2e`
# in ci.yml: when CI already ran this commit, Nx Cloud returns its result
E2E_BROWSERS= npx nx run cv-e2e:e2e

echo "📚 Generating the GraphQL API docs..."
npx nx run api:graphql-docs

echo "🏗️  Generating the build info and project graph..."
npx nx run technical-data-access-build-info:build-info
npx nx run @axel-pauwels/cv:project-graph

echo "🔧 Starting production build..."
npx nx build cv --configuration=production
