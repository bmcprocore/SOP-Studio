#!/usr/bin/env node
/**
 * publish-build.js — produce a shareable Studio file with the approved template library
 * baked in, so whoever opens it has the templates on first run with nothing to install.
 *
 *   node scripts/publish-build.js                    # bundle every master library in templates/
 *   node scripts/publish-build.js --version 4        # set the library version explicitly
 *   node scripts/publish-build.js --only RFIs        # bundle just one tool
 *   node scripts/publish-build.js --out dist/x.html
 *
 * The library version is what tells an existing user their copy is out of date. It bumps
 * automatically from the last published build unless you set it.
 *
 * Templates a person saved themselves are never overwritten when they open a newer build —
 * only entries that came from a published build are replaced.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const APP = path.join(ROOT, 'app', 'SOP_Studio_v0.1.html');
const DIST = path.join(ROOT, 'dist');
const STAMP = path.join(DIST, '.last-published.json');

const arg = (flag, fallback) => {
  const i = process.argv.indexOf(flag);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : fallback;
};

/** Every templates/<tool>/master-library-*.json, newest version per tool. */
function collectTemplates(only) {
  const dir = path.join(ROOT, 'templates');
  if (!fs.existsSync(dir)) return {};
  const out = {};
  fs.readdirSync(dir).forEach((tool) => {
    const toolDir = path.join(dir, tool);
    if (!fs.statSync(toolDir).isDirectory()) return;
    const files = fs.readdirSync(toolDir).filter((f) => /^master-library-.*\.json$/.test(f)).sort();
    if (!files.length) return;
    const file = files[files.length - 1];            // highest version wins
    const body = JSON.parse(fs.readFileSync(path.join(toolDir, file), 'utf8'));
    // The app keys its library by the Procore tool name (RFIs, Submittals). The master library
    // carries that on its personas, not at the top level.
    const firstPersona = Object.values(body._personas || {})[0] || {};
    const name = (body.access && body.access.tool) || (firstPersona.access && firstPersona.access.tool) ||
      body.referenceTool || body.name || tool.toUpperCase();
    if (only && name !== only) return;
    // strip the authoring-only keys the app does not consume
    delete body._how_to_use;
    body.name = name;
    out[name] = { file: path.join('templates', tool, file), body };
  });
  return out;
}

function nextVersion() {
  try { return (JSON.parse(fs.readFileSync(STAMP, 'utf8')).version || 0) + 1; } catch (e) { return 1; }
}

function main() {
  if (!fs.existsSync(APP)) { console.error('Cannot find ' + APP); process.exit(1); }

  const found = collectTemplates(arg('--only', null));
  const names = Object.keys(found);
  if (!names.length) { console.error('No master libraries found under templates/ — nothing to publish.'); process.exit(1); }

  const version = parseInt(arg('--version', String(nextVersion())), 10);
  const publishedAt = new Date().toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });

  const library = { version, publishedAt, tools: {} };
  names.forEach((n) => { library.tools[n] = found[n].body; });

  // `</script>` inside the JSON would end the script block early, so escape it.
  const json = JSON.stringify(library)
    .replace(/<\/script/gi, '<' + String.fromCharCode(92) + '/script');

  let html = fs.readFileSync(APP, 'utf8');
  const marker = /  const PUBLISHED_LIBRARY = .*; \/\* PUBLISHED_LIBRARY \*\//;
  if (!marker.test(html)) {
    console.error('The PUBLISHED_LIBRARY marker is missing from the app. Has it been edited by hand?');
    process.exit(1);
  }
  html = html.replace(marker, '  const PUBLISHED_LIBRARY = ' + json + '; /* PUBLISHED_LIBRARY */');

  const studioVersion = (html.match(/>v([0-9.]+)</) || [])[1] || 'x';
  const out = arg('--out', path.join('dist', 'SOP_Studio_v' + studioVersion + '_library-v' + version + '.html'));
  fs.mkdirSync(path.dirname(path.resolve(ROOT, out)), { recursive: true });
  fs.writeFileSync(path.resolve(ROOT, out), html);
  fs.writeFileSync(STAMP, JSON.stringify({ version, publishedAt, tools: names }, null, 2));

  const kb = (n) => Math.round(n / 1024) + ' KB';
  console.log('Published library v' + version + ' · ' + publishedAt);
  names.forEach((n) => {
    const b = found[n].body;
    console.log('  ' + n.padEnd(14) + (b.steps || []).length + ' steps · ' +
      (b.checklist || []).length + ' checklist · ' + (b.issues || []).length + ' issues   ' + found[n].file);
  });
  console.log('\nWrote ' + out + '  (' + kb(html.length) + ')');
  console.log('Share that one file. Opening it installs the templates — no seeding, no import.');
  console.log('Anyone on an older build sees the new library the moment they open this one;');
  console.log('templates they saved themselves are left alone.');
}

main();
