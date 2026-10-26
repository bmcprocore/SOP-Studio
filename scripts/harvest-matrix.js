#!/usr/bin/env node
/**
 * harvest-matrix.js — capture a Procore tool's User Permissions Matrix as structured facts.
 *
 * WHY THIS PARSES HTML RATHER THAN ASKING A MODEL: these rows become `_perm` tags, and a wrong
 * tag becomes a wrong permission claim in a client's SOP. The table is parsed deterministically
 * so the output is a transcription of Procore's page, not an interpretation of it. A summariser
 * was tried first and got a row wrong ("Add a Drawing Area" is Admin-only, not Standard+Admin).
 *
 * Output is EVIDENCE, not a template: docs/reference/matrix/<tool-id>.json, holding every action
 * row with the levels that allow it and any granular permission the cell names. Seeding a content
 * library from that evidence is a separate step (`seed-library.js`).
 *
 * Politeness: v2.support.procore.com/robots.txt sets Crawl-delay: 5 and Request-rate: 1/5.
 * This script waits 5s between requests and fetches each page once.
 *
 * Usage:
 *   node scripts/harvest-matrix.js --tool project-rfis
 *   node scripts/harvest-matrix.js --all [--limit 10] [--only project]
 *   node scripts/harvest-matrix.js --tool project-drawings --show    # print, write nothing
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const REGISTRY = path.join('templates', '_registry.json');
const OUTDIR = path.join('docs', 'reference', 'matrix');
const CRAWL_DELAY_MS = 5000;          // robots.txt: Crawl-delay: 5
const LEVELS = ['None', 'Read Only', 'Standard', 'Admin'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function get(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 4) return reject(new Error('too many redirects'));
    https.get(url, { headers: { 'User-Agent': 'Procore-SOP-Studio/1.0 (internal implementation tooling; contact the GPS APAC team)' } }, (r) => {
      if ([301, 302, 307, 308].includes(r.statusCode) && r.headers.location) {
        r.resume();
        return resolve(get(new URL(r.headers.location, url).href, redirects + 1));
      }
      let d = '';
      r.setEncoding('utf8');
      r.on('data', (c) => (d += c));
      r.on('end', () => resolve({ status: r.statusCode, body: d }));
    }).on('error', reject);
  });
}

const stripTags = (s) => s.replace(/<svg[\s\S]*?<\/svg>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();

/** Platforms are inline SVG icons followed by their label. */
function platformsOf(cellHtml) {
  const txt = cellHtml.replace(/<svg[\s\S]*?<\/svg>/gi, '|').replace(/<[^>]+>/g, ' ');
  return ['Web', 'iOS', 'Android'].filter((p) => new RegExp('\\|\\s*' + p + '\\b', 'i').test(txt));
}

/** A cell allows the action if it carries a check image. `alt="...Check Gp"` means the check is
 *  conditional on a granular permission, which the cell then names. */
function readCell(cellHtml) {
  const imgs = [...cellHtml.matchAll(/<img[^>]*class="inline-asset"[^>]*>/gi)].map((m) => m[0]);
  if (!imgs.length) return { allowed: false, granular: [], anyOf: false };
  const isGp = imgs.some((i) => /alt="[^"]*\bGp\b[^"]*"/i.test(i));
  // Granular names sit in .complex-table-cell list items; "OR" between them means any-of.
  const names = [...cellHtml.matchAll(/<div class="complex-table-cell">([\s\S]*?)<\/div>/gi)]
    .map((m) => stripTags(m[1]))
    .filter(Boolean);
  const anyOf = /<\/div>\s*OR/i.test(cellHtml);
  return { allowed: true, granular: names, anyOf, conditional: isGp };
}

function parseMatrix(html, url) {
  const start = html.search(/<table/i);
  if (start < 0) return { error: 'no table found in page' };
  const table = html.slice(start, html.search(/<\/table>/i));
  const rows = table.split(/<tr[^>]*>/i).slice(1);
  const cellsOf = (row) => row.split(/<t[dh][^>]*>/i).slice(1).map((c) => c.replace(/<\/t[dh]>[\s\S]*/i, ''));

  const header = cellsOf(rows[0]).map(stripTags);
  // Locate each level column by its header text, rather than assuming positions.
  const col = {};
  LEVELS.forEach((l) => {
    const i = header.findIndex((h) => h.toLowerCase() === l.toLowerCase());
    if (i > -1) col[l] = i;
  });
  const levelsOffered = LEVELS.filter((l) => col[l] !== undefined);
  if (!levelsOffered.length) return { error: 'no permission-level columns found; header was: ' + JSON.stringify(header) };

  const actions = [];
  const warnings = [];
  rows.slice(1).forEach((row, n) => {
    const c = cellsOf(row);
    if (c.length < 2) return;
    const name = stripTags(c[0].replace(/<svg[\s\S]*?<\/svg>/gi, '|')).replace(/\s*\|\s*(Web|iOS|Android)\b/gi, '').replace(/\|/g, '').trim();
    if (!name) return;
    const allowedAt = [];
    const granularBy = {};
    let conditional = false;
    levelsOffered.forEach((l) => {
      const cell = c[col[l]];
      if (cell === undefined) return;
      const v = readCell(cell);
      if (!v.allowed) return;
      allowedAt.push(l);
      if (v.granular.length) granularBy[l] = { anyOf: v.anyOf, permissions: v.granular };
      if (v.conditional) conditional = true;
    });
    if (!allowedAt.length) warnings.push('row ' + (n + 1) + ' "' + name.slice(0, 60) + '" allows no level');
    actions.push({
      action: name,
      platforms: platformsOf(c[0]),
      allowedAt,
      minLevel: allowedAt.filter((l) => l !== 'None')[0] || null,
      granularBy: Object.keys(granularBy).length ? granularBy : undefined,
      requiresGranular: conditional || undefined,
    });
  });

  return { levelsOffered, actions, warnings, source: url, harvested: new Date().toISOString().slice(0, 10) };
}

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : fallback;
}

async function main() {
  const reg = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
  const show = process.argv.includes('--show');
  const one = arg('--tool', null);
  const only = arg('--only', null);
  const limit = parseInt(arg('--limit', '0'), 10);

  let targets;
  if (one) {
    // --tool accepts one id or a comma-separated list.
    targets = one.split(',').map((s) => s.trim()).filter(Boolean).map((id) => {
      const t = reg.tools.find((x) => x.id === id);
      if (!t) { console.error('Unknown tool id "' + id + '". Try: node scripts/check-registry.js'); process.exit(1); }
      return t;
    });
  } else if (process.argv.includes('--all')) {
    targets = reg.tools.filter((t) => !only || t.level === only);
    // Skip tools already harvested, so a run can be resumed.
    targets = targets.filter((t) => !fs.existsSync(path.join(OUTDIR, t.id + '.json')));
    if (limit) targets = targets.slice(0, limit);
  } else {
    console.error('Specify --tool <id> or --all [--only project|company] [--limit N]');
    process.exit(1);
  }

  fs.mkdirSync(OUTDIR, { recursive: true });
  console.log('Harvesting ' + targets.length + ' tool(s), 5s between requests (robots.txt Crawl-delay: 5)\n');

  let ok = 0, failed = 0;
  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    if (i) await sleep(CRAWL_DELAY_MS);
    let res;
    try { res = await get(t.sources.matrix); }
    catch (e) { console.log('  FETCH FAILED  ' + t.id + ' — ' + e.message); failed++; continue; }
    if (res.status !== 200) { console.log('  HTTP ' + res.status + '     ' + t.id + ' — ' + t.sources.matrix); failed++; continue; }

    const parsed = parseMatrix(res.body, t.sources.matrix);
    if (parsed.error) { console.log('  PARSE FAILED  ' + t.id + ' — ' + parsed.error); failed++; continue; }

    const out = { tool: t.tool, id: t.id, level: t.level, ...parsed };
    const gran = parsed.actions.filter((a) => a.granularBy).length;
    console.log('  ' + t.id.padEnd(34) + parsed.actions.length.toString().padStart(3) + ' actions · levels: ' +
      parsed.levelsOffered.join('/') + (gran ? ' · ' + gran + ' granular-gated' : ''));
    parsed.warnings.slice(0, 3).forEach((w) => console.log('      warning: ' + w));

    if (show) { console.log(JSON.stringify(out, null, 2).slice(0, 3000)); }
    else fs.writeFileSync(path.join(OUTDIR, t.id + '.json'), JSON.stringify(out, null, 2));
    ok++;
  }

  console.log('\n' + ok + ' harvested, ' + failed + ' failed.');
  if (!show && ok) console.log('Written to ' + OUTDIR + '/  — evidence only. Seed a library from it with seed-library.js.');
}

main().catch((e) => { console.error(e); process.exit(1); });
