#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const isCI = process.argv.includes('--ci');

const mainLangFile = path.resolve(__dirname, '../channels/src/i18n/en.json');
const otherLangs = ['es', 'it', 'fr', 'de'].map(lang =>
  path.resolve(__dirname, `../channels/src/i18n/${lang}.json`)
);

function runI18nExtract() {
  try {
    execSync('yarn i18n-extract --check', { stdio: 'inherit' });
  } catch {
    console.error('\n⛔ i18n extract produced changes. Run `yarn i18n-extract` to fix.');
    process.exit(1);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function getLangStatus(enKeys, langFile) {
  const lang = path.basename(langFile, '.json');
  if (!fs.existsSync(langFile)) {
    return { lang, missing: [], extra: [], missingFile: true };
  }

  const data = readJson(langFile);
  const keys = Object.keys(data);
  return {
    lang,
    data,
    missingFile: false,
    missing: enKeys.filter(k => !keys.includes(k)),
    extra: keys.filter(k => !enKeys.includes(k)),
  };
}

function cleanExtraKeys(langFile, data, extraKeys) {
  extraKeys.forEach(k => delete data[k]);
  writeJson(langFile, data);
  console.log(`🧹 Cleaned ${extraKeys.length} extra keys from ${path.basename(langFile)}`);
}

function checkAndCleanTranslations() {
  const en = readJson(mainLangFile);
  const enKeys = Object.keys(en);
  let failed = false;
  let hasChanges = false;

  otherLangs.forEach(langFile => {
    const { lang, data, missing, extra, missingFile } = getLangStatus(enKeys, langFile);

    if (missingFile) {
      console.error(`⛔ Missing translation file: ${langFile}`);
      failed = true;
      return;
    }

    if (missing.length > 0) {
      console.error(`⛔ ${lang} is missing keys:\n  - ${missing.join('\n  - ')}`);
      failed = true;
    }

    if (extra.length > 0) {
      console.log(`🧹 ${lang} has ${extra.length} extra keys:`);
      console.log('  - ' + extra.join('\n  - '));

      if (isCI) {
        hasChanges = true; // don't modify, just flag
      } else {
        cleanExtraKeys(langFile, data, extra);
      }
    }
  });

  if (failed || hasChanges) {
    if (isCI && hasChanges) {
      console.error('⛔ CI mode: extra keys found. Run the script locally to clean them.');
    }
    process.exit(1);
  }
}

function main() {
  runI18nExtract();
  checkAndCleanTranslations();
  console.log('✅ Translations cleaned and up-to-date!');
}

main();
