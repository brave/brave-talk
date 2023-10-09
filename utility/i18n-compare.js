#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const glob = require("glob");

const locales = path.normalize(`${__dirname}/../src/i18n/locales`);

// parse an l10n file

const l10n = (lang) => {
  let data;

  try {
    data = fs.readFileSync(`${locales}/${lang}/translation.json`);
  } catch (ex) {
    return console.error(
      `unable to open file for "${lang}":`,
      ex.path,
      ex.code,
    );
  }

  try {
    return { lang, model: JSON.parse(data) };
  } catch (ex) {
    console.error(`unable to parse file for "${lang}":`, ex.code);
  }
};

// the ubiquitous usage statement

const usage = (followupP) => {
  const langs = [];

  if (followupP) console.log("");
  console.error(`usage: ${myname} [code ...] (e.g., "jp")`);
  console.error(
    `       if only one code is given, it is compared against ${base}`,
  );

  glob.sync(`${locales}/*`).forEach((entry) => {
    const lang = path.basename(entry);

    if (iso3166.test(lang)) langs.push(lang);
  });
  console.error(`available codes: ${langs.join(", ")}`);
  process.exit(1);
};

// a very simple CLI

const myname = path.basename(process.argv[1]);
const argc = process.argv.length;
const iso3166 = /^[a-z]{2}(?:-[a-z]{2})?$/;

let base = "en";
let targets = [];

switch (argc) {
  case 3: // ... target-l10n
    const target = process.argv[2];

    if (iso3166.test(target)) targets.push(target);
    break;

  default: // ... source-l10n target-10n ...
    if (argc < 4) break;

    base = process.argv[2];
    if (!iso3166.test(base)) break;

    process.argv.slice(3).forEach((target) => {
      if (!targets) return;
      if (!iso3166.test(target)) {
        targets = null;
        return;
      }
      targets.push(target);
    });
    break;
}
if (targets && targets.length === 1 && targets[0] === base) {
  targets = null;
}
if (!targets || !targets.length) usage(false);

const baseline = l10n(base);

let models = [];
targets.forEach((target) => {
  const result = l10n(target);

  if (!models) return;
  if (!result) {
    models = null;
    return;
  }
  models.push(result);
});
if (!baseline || !models || !models.length) usage(true);

const multipleP = models.length > 1;
models.forEach((target) => {
  if (target.lang === base) return;

  console.log("{" + (multipleP ? ` // ${target.lang}` : ""));
  Object.keys(baseline.model).forEach((key) => {
    const value = target.model[key] || `<<< ${baseline.model[key]}`;
    console.log(`  "${key}": "${value}",`);
  });
  console.log("}");
});
