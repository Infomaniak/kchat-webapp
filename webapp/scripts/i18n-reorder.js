// scripts/reorder-locales.js
const fs = require('fs');
const path = require('path');

// i18n files location
const i18nDir = path.resolve(__dirname, '../channels/src/i18n');
const basePath = path.join(i18nDir, 'en.json');
const locales = ['fr','it','de', 'es'].map(l => path.join(i18nDir, `${l}.json`));

const base = JSON.parse(fs.readFileSync(basePath, 'utf-8'));

locales.forEach(localePath => {
  const name = path.basename(localePath);
  let current = {};
  try {
    current = JSON.parse(fs.readFileSync(localePath, 'utf-8'));
  } catch {
    console.warn(`${name} not found or invalid JSON, skipping.`);
    return;
  }

  // Reorder keys: first keys in en.json, then any extras at the end
  const newLocale = {};
  const baseKeys = Object.keys(base);

  // Add keys in en.json order
  baseKeys.forEach(k => {
    if (k in current) {
      newLocale[k] = current[k];
    }
  });

  // Add remaining keys that are not in en.json
  Object.keys(current)
    .filter(k => !baseKeys.includes(k))
    .forEach(k => {
      newLocale[k] = current[k];
    });

  fs.writeFileSync(localePath, JSON.stringify(newLocale, null, 2) + '\n');
  console.log(`${name} reordered`);
});

console.log('All locales reordered to match en.json order ✅');
