#!/usr/bin/env node
/**
 * check-registry.js — validate templates/_registry.json, the template gallery index.
 *
 * The registry drives which granular permissions the Studio offers once a tool's template is
 * chosen. A wrong or missing entry there becomes a wrong permission claim in a client's SOP,
 * so it is checked rather than trusted.
 */
const fs = require('fs');
const path = require('path');

const P = path.join('templates', '_registry.json');
const problems = [];
const bad = (id, msg) => problems.push(id + ': ' + msg);

if (!fs.existsSync(P)) {
  console.log('ERRORS: ' + P + ' does not exist. Run: node scripts/seed-registry.js');
  process.exit(1);
}
const r = JSON.parse(fs.readFileSync(P, 'utf8'));

const ACCOUNTS = r.accountTypes || [];
const LEVELS = r.permissionLevels || [];
const seen = new Set();

(r.tools || []).forEach((t) => {
  const id = t.id || '(no id)';
  if (!t.id) bad('(anonymous)', 'missing id');
  if (seen.has(t.id)) bad(id, 'duplicate id');
  seen.add(t.id);

  if (!t.tool) bad(id, 'missing tool name');
  if (!['project', 'company'].includes(t.level)) bad(id, 'level must be project or company');
  if (!t.category) bad(id, 'missing category');

  ACCOUNTS.forEach((a) => {
    if (!t.names || !t.names[a]) bad(id, 'no name for account type ' + a);
  });
  if (!t.nameAPAC) bad(id, 'missing nameAPAC');
  if (!t.sources || !t.sources.matrix) bad(id, 'missing the permissions-matrix source URL');

  (t.levelsOffered || []).forEach((l) => {
    if (!LEVELS.includes(l)) bad(id, 'levelsOffered has an unknown level "' + l + '"');
  });

  const gran = t.granular || [];
  gran.forEach((x, i) => {
    if (!x.name) bad(id, 'granular[' + i + '] has no name');
    if (!x.source) bad(id, 'granular "' + (x.name || i) + '" has no source — every permission claim must be attributable');
    (x.appliesTo || []).forEach((l) => {
      if (!LEVELS.includes(l)) bad(id, 'granular "' + x.name + '" appliesTo has an unknown level "' + l + '"');
    });
  });
  const names = gran.map((x) => x.name.toLowerCase());
  names.forEach((n, i) => { if (names.indexOf(n) !== i) bad(id, 'duplicate granular permission "' + gran[i].name + '"'); });

  const st = t.granularStatus;
  if (!['not-harvested', 'faq-verified', 'capture-only', 'none-exist'].includes(st)) {
    bad(id, 'granularStatus "' + st + '" is not one of not-harvested | faq-verified | capture-only | none-exist');
  }
  if (st === 'not-harvested' && gran.length) bad(id, 'has granular permissions but is still marked not-harvested');
  if (st === 'none-exist' && gran.length) bad(id, 'marked none-exist but lists granular permissions');

  if (t.library && !fs.existsSync(t.library)) bad(id, 'library path does not exist: ' + t.library);
  if (t.library && t.libraryStatus === 'none') bad(id, 'has a library but libraryStatus is none');
  if (!t.library && t.libraryStatus !== 'none') bad(id, 'libraryStatus is ' + t.libraryStatus + ' but no library is linked');
});

const tools = r.tools || [];
const by = (f) => tools.filter(f).length;
console.log('Registry v' + r._version + ' — ' + tools.length + ' tools (' +
  by((t) => t.level === 'project') + ' project, ' + by((t) => t.level === 'company') + ' company)');
console.log('  granular harvested : ' + by((t) => t.granularStatus !== 'not-harvested') + '/' + tools.length +
  '  (faq-verified ' + by((t) => t.granularStatus === 'faq-verified') +
  ', capture-only ' + by((t) => t.granularStatus === 'capture-only') + ')');
console.log('  granular entries   : ' + tools.reduce((n, t) => n + (t.granular || []).length, 0));
console.log('  content libraries  : ' + by((t) => t.library) + '/' + tools.length +
  '  (verified ' + by((t) => t.libraryStatus === 'verified') + ')');
console.log('  levels confirmed   : ' + by((t) => (t.levelsOffered || []).length) + '/' + tools.length);

if (problems.length) {
  console.log('\nERRORS (' + problems.length + '):');
  problems.slice(0, 40).forEach((p) => console.log('  ' + p));
  process.exit(1);
}
console.log('\nRegistry is structurally sound.');
