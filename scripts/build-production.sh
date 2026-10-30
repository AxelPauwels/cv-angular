#!/bin/bash
echo "🔧 Starting production build..."

npx nx build cv --configuration=production
