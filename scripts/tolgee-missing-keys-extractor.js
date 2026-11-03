const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Match keys like 't.language.english' or "t.nav.experience"
const pattern = /['"]t\.([a-zA-Z0-9_.-]+)['"]/g;

const inputPaths = [
  'apps/**/*.html',
  'libs/**/*.html',
  'apps/**/*.ts',
  'libs/**/*.ts',
];
const translationDir = './apps/cv/src/assets/i18n';
const language = 'en'; // change to your target language file
const translationFile = path.join(translationDir, `${language}.json`);

const keys = new Set();

// Step 1: Extract keys from source files
inputPaths.forEach((input) => {
  const files = glob.sync(input);
  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = pattern.exec(content)) !== null) {
      keys.add(`t.${match[1]}`);
    }
  });
});

// Step 2: Load existing translations
const translations = fs.existsSync(translationFile)
  ? JSON.parse(fs.readFileSync(translationFile, 'utf8'))
  : {};

// Step 3: Check if nested key exists
function hasNestedKey(obj, keyPath) {
  const parts = keyPath.split('.');
  let current = obj;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return false;
    }
  }

  return typeof current === 'string' && current.trim() !== '';
}

// Step 4: Filter out untranslated keys
const untranslated = Array.from(keys).filter((key) => {
  const keyPath = key.replace(/^t\./, ''); // remove leading 't.'
  return !hasNestedKey(translations.t, keyPath);
});

// Step 5: Save result
fs.writeFileSync(
  './scripts/tolgee-missing-keys.json',
  JSON.stringify(untranslated.sort(), null, 2)
);
console.log(
  `✅ Found ${untranslated.length} untranslated keys. Saved to tolgee-missing-keys.json`
);
