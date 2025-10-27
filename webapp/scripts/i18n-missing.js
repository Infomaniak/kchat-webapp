// scripts/list-missing-keys-with-en.js
const fs = require('fs');
const path = require('path');

// i18n files location
const i18nDir = path.resolve(__dirname, '../channels/src/i18n');
const basePath = path.join(i18nDir, 'en.json');
const locales = ['fr','it','de', 'es'].map(l => path.join(i18nDir, `${l}.json`));

const base = JSON.parse(fs.readFileSync(basePath, 'utf-8'));

const report = {};

locales.forEach(localePath => {
  const name = path.basename(localePath);
  let current = {};
  try {
    current = JSON.parse(fs.readFileSync(localePath, 'utf-8'));
  } catch {
    console.warn(`${name} not found or invalid JSON`);
    report[name] = 'invalid or missing file';
    return;
  }

  const missingKeys = Object.keys(base)
    .filter(k => !(k in current))
    .reduce((acc, k) => {
      acc[k] = base[k]; // include English text
      return acc;
    }, {});

  report[name] = Object.keys(missingKeys).length ? missingKeys : 'none';
});

// Write report to file
const outputPath = path.join(i18nDir, 'missing-keys-report.json');
fs.writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');

console.log(`Missing keys report with English defaults written to ${outputPath}`);
