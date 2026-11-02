#!/bin/bash
set -e

# The coverage and e2e reports are copied into the build as assets
# (/coverage and /e2e-report, see apps/cv/project.json), so generate them first.
echo "🧪 Running unit tests with coverage..."
npx nx run cv:test:ci --coverage

echo "🎭 Running e2e tests..."
npx nx run cv-e2e:e2e

echo "🔧 Starting production build..."
npx nx build cv --configuration=production
