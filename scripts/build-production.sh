#!/bin/bash
set -e

# The dev environment imports the gitignored Tolgee tokens; CI has no copy
TOKENS=apps/cv/src/tokens/environment.tokens.ts
[ -f "$TOKENS" ] || cp apps/cv/src/tokens/environment.tokens.example.ts "$TOKENS"

# The deploy workflows pass the TOLGEE_API_KEY secret, so production ships the
# latest translations; the key only talks to Tolgee and never enters the build
if [ -n "$TOLGEE_API_KEY" ]; then
  echo "🌍 Pulling translations from Tolgee..."
  npm run i18n:pull
else
  echo "⚠️  TOLGEE_API_KEY not set, building with the committed translations"
fi

# The coverage and e2e reports are copied into the build as assets
# (/coverage and /e2e-report, see apps/cv/project.json), so generate them first.
echo "🧪 Running unit tests with coverage..."
npx nx run cv:test:ci --coverage

echo "🎭 Running e2e tests..."
npx nx run cv-e2e:e2e

echo "🔧 Starting production build..."
npx nx build cv --configuration=production
