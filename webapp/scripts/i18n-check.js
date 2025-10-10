#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const mainLangFile = path.resolve(__dirname, '../channels/src/i18n/en.json');
const otherLangs = ['es', 'it', 'fr', 'de'].map(lang =>
  path.resolve(__dirname, `../channels/src/i18n/${lang}.json`)
);

function runI18nExtract() {
  try {
    execSync('yarn i18n-extract --check', { stdio: 'inherit' });
  } catch (e) {
    console.error('\n⛔ i18n extract produced changes. Run `yarn i18n-extract` to fix.');
    process.exit(1);
  }
}

function getJsonKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return Object.keys(JSON.parse(content));
}

function checkTranslations() {
  const enKeys = getJsonKeys(mainLangFile);
  let failed = false;

  otherLangs.forEach(langFile => {
    const lang = path.basename(langFile, '.json');
    if (!fs.existsSync(langFile)) {
      console.error(`⛔ Missing translation file: ${langFile}`);
      failed = true;
      return;
    }
    const keys = getJsonKeys(langFile);
    const missing = enKeys.filter(k => !keys.includes(k));
    if (missing.length > 0) {
      console.error(`⛔ ${lang} is missing keys:\n  - ${missing.join('\n  - ')}`);
      failed = true;
    }
  });

  if (failed) process.exit(1);
}

function main() {
  runI18nExtract();
  checkTranslations();
  console.log('✅ Translations are up-to-date!');
}

main();
