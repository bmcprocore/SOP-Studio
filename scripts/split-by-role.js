#!/usr/bin/env node
/**
 * split-by-role.js — produce a persona-scoped SOP content JSON from a master library.
 *
 * PERMISSION IS THE GATE. Every guide is built from a persona in the library's `_personas`
 * map: that map is the permission-correct list of blocks, and it carries the persona's
 * `access` object (which fills Section 1, "Your access in this tool") and its `cannot_do`
 * statement. Nothing is generated without one.
 *
 * Job role is an OPTIONAL narrowing *inside* that permission scope — a shorter training
 * handout for one role. It can only ever remove blocks the persona is already permitted;
 * whatever it removes is listed on screen so the human can see what the reader will not get.
 *
 * This script only ever removes content and copies authored content across. It never
 * invents client names, dates, SLAs or process detail.
 *
 * Usage:
 *   node scripts/split-by-role.js <master.json> --list
 *   node scripts/split-by-role.js <master.json> --persona <key> [--role "<Role>"]
 *                                 [--detail simple|standard|extended] [--region APAC] [--out <path>]
 *   node scripts/split-by-role.js <master.json> --all-personas [--detail ...] [--region APAC]
 *
 * Output: output/<Process>_<persona>_<detail>.json  (override with --out)
 */
const fs = require('fs');
const path = require('path');

// Steps tagged with one of these belong in every role's guide.
const SHARED_ROLES = ['all users', 'all', 'everyone', 'any user'];
// Keys that exist only on a master library and must not reach the renderer.
const MASTER_ONLY = ['_library', '_how_to_use', '_personas'];
// Abbreviations used in the library's owner/role fields. Matching on raw strings missed
// "RFI Mgr" against the role "RFI Manager" and silently dropped a manager's own sign-off items.
const WORD_ALIASES = {
  mgr: 'manager', admin: 'administrator', coord: 'coordinator',
  eng: 'engineer', supt: 'superintendent', asst: 'assistant',
};

const isShared = (role) => SHARED_ROLES.includes(String(role || '').trim().toLowerCase());
const slug = (s) => String(s || '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Compare role/owner labels by meaning rather than by raw substring:
 *  lower-cased, punctuation dropped, abbreviations expanded, simple plurals folded. */
function tokens(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => WORD_ALIASES[w] || w)
    .map((w) => (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w));
}

/** True when one label is the same as, or a more specific form of, the other
 *  ("Creator" is within "RFI Creator"; "RFI Mgr" equals "RFI Manager"). */
function labelsMatch(a, b) {
  const A = tokens(a), B = tokens(b);
  if (!A.length || !B.length) return false;
  return A.every((t) => B.includes(t)) || B.every((t) => A.includes(t));
}

/** Strip everything the "simple" level is defined to omit, so the level is real in
 *  every renderer rather than only in the app's built-in one. */
function applySimple(c) {
  c.issues = [];
  (c.steps || []).forEach((s) => {
    delete s.bullets;
    delete s.callout;
    delete s.time;
  });
  return c;
}

/** Resolve a persona by key, by key fragment (e.g. "P3") or by label. */
function findPersona(master, wanted) {
  const map = master._personas || {};
  const keys = Object.keys(map);
  if (map[wanted]) return [wanted, map[wanted]];
  const w = String(wanted || '').toLowerCase();
  const hit =
    keys.find((k) => k.toLowerCase() === w) ||
    keys.find((k) => k.toLowerCase().startsWith(w + '_')) ||
    keys.find((k) => k.toLowerCase().includes(w)) ||
    keys.find((k) => String(map[k].label || '').toLowerCase().includes(w));
  return hit ? [hit, map[hit]] : [null, null];
}

/** Keep the blocks the persona is permitted, in library order. Report ids the map
 *  names but the library does not hold, so a stale persona map cannot pass unnoticed. */
function scopeToPersona(c, persona, warn) {
  const take = (list, ids, what) => {
    const want = Array.isArray(ids) ? ids : [];
    const have = (list || []).filter((b) => want.includes(b._id));
    const missing = want.filter((id) => !(list || []).some((b) => b._id === id));
    if (missing.length) warn('persona map lists ' + what + ' not in this library: ' + missing.join(', '));
    return have;
  };
  c.steps = take(c.steps, persona.steps, 'step(s)');
  c.checklist = take(c.checklist, persona.checklist, 'checklist item(s)');
  c.issues = take(c.issues, persona.issues, 'issue(s)');
  return c;
}

function splitPersona(master, personaKey, persona, opts) {
  const warnings = [];
  const warn = (m) => warnings.push(m);
  const c = JSON.parse(JSON.stringify(master));
  MASTER_ONLY.forEach((k) => delete c[k]);

  const lib = {
    steps: (c.steps || []).length,
    checklist: (c.checklist || []).length,
    issues: (c.issues || []).length,
  };

  // 1 — permission scope (mandatory).
  scopeToPersona(c, persona, warn);
  const permitted = { steps: c.steps.length, checklist: c.checklist.length, issues: c.issues.length };

  // 2 — Section 1 "Your access in this tool" comes from the persona, verbatim.
  if (persona.access) {
    c.access = JSON.parse(JSON.stringify(persona.access));
  } else {
    warn('persona has no "access" object — Section 1 will render as placeholders');
  }

  // 3 — the persona's "cannot do" statement, per the framework standard, into procedureIntro.
  const cannot = String(persona.cannot_do || '').trim();
  if (cannot && !String(c.procedureIntro || '').includes(cannot)) {
    c.procedureIntro = String(c.procedureIntro || '').trim() +
      (c.procedureIntro ? ' ' : '') + '<strong>What you cannot do:</strong> ' + cannot;
  }

  // 4 — optional job-role narrowing, inside the permitted set only.
  const roleDropped = { steps: [], checklist: [] };
  if (opts.role) {
    c.steps = (c.steps || []).filter((s) => {
      const keep = labelsMatch(s.role, opts.role) || isShared(s.role);
      if (!keep) roleDropped.steps.push(s._id + ' ' + (s.title || ''));
      return keep;
    });
    c.checklist = (c.checklist || []).filter((it) => {
      const keep = !String(it.owner || '').trim() || labelsMatch(it.owner, opts.role) || isShared(it.owner);
      if (!keep) roleDropped.checklist.push(it._id + ' ' + (it.text || ''));
      return keep;
    });
    if (!c.steps.length) warn('the role filter removed every step — check the --role spelling against --list');
    c._role = opts.role;
  }

  c._persona = personaKey;
  c._detail = opts.detail;
  c.status = 'draft';
  if (opts.region) c._region = opts.region;
  if (c.docId) c.docId = String(c.docId) + '-' + slug(opts.role || personaKey).toUpperCase().slice(0, 12);

  if (opts.detail === 'simple') applySimple(c);

  return { content: c, stats: { lib, permitted, roleDropped, warnings } };
}

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
    ? process.argv[i + 1]
    : fallback;
}

function listLibrary(master, src) {
  const personas = master._personas || {};
  console.log('Personas in ' + path.basename(src) + ' (permission scope — pick one with --persona):');
  Object.keys(personas).forEach((k) => {
    const p = personas[k];
    console.log('  ' + k.padEnd(26) + (p.label || ''));
    console.log('  ' + ''.padEnd(26) +
      (p.steps || []).length + ' steps · ' +
      (p.checklist || []).length + ' checklist · ' +
      (p.issues || []).length + ' issues');
  });
  const roles = [];
  (master.steps || []).forEach((s) => {
    const r = (s.role || '').trim();
    if (r && !isShared(r) && !roles.includes(r)) roles.push(r);
  });
  console.log('\nJob roles in the steps (optional narrowing with --role, inside a persona):');
  roles.forEach((r) => {
    const n = (master.steps || []).filter((s) => s.role === r).length;
    console.log('  ' + r.padEnd(28) + n + ' step' + (n === 1 ? '' : 's'));
  });
  const shared = (master.steps || []).filter((s) => isShared(s.role)).length;
  if (shared) console.log('  ' + '(shared — in every guide)'.padEnd(28) + shared + ' steps');
}

function main() {
  const src = process.argv[2];
  if (!src || src.startsWith('--')) {
    console.error('Usage: node scripts/split-by-role.js <master.json> --list | --persona <key> [--role "<Role>"] | --all-personas [--detail simple|standard|extended] [--region APAC]');
    process.exit(1);
  }
  const master = JSON.parse(fs.readFileSync(src, 'utf8'));
  const personas = master._personas || {};
  const personaKeys = Object.keys(personas);

  if (!personaKeys.length) {
    console.error('This library has no "_personas" map. Permission scope cannot be established, so no guide can be generated.');
    process.exit(1);
  }

  if (process.argv.includes('--list')) {
    listLibrary(master, src);
    return;
  }

  const detail = arg('--detail', 'standard');
  if (!['simple', 'standard', 'extended'].includes(detail)) {
    console.error('--detail must be simple, standard or extended');
    process.exit(1);
  }

  const region = arg('--region', null);
  const role = arg('--role', null);

  const wantAll = process.argv.includes('--all-personas') || process.argv.includes('--all');
  let targets;
  if (wantAll) {
    if (role) {
      console.error('--role applies to a single persona; use --persona with --role.');
      process.exit(1);
    }
    targets = personaKeys;
  } else {
    const wanted = arg('--persona', null);
    if (!wanted) {
      console.error(
        'Specify --persona <key> (or --all-personas). Available: ' + personaKeys.join(' | ') + '\n' +
        'A persona sets the permission scope and fills Section 1. --role alone cannot: it filters by\n' +
        'job title and would let content the reader has no permission for through into the document.'
      );
      process.exit(1);
    }
    const [key] = findPersona(master, wanted);
    if (!key) {
      console.error('Unknown persona "' + wanted + '". Available: ' + personaKeys.join(' | '));
      process.exit(1);
    }
    targets = [key];
  }

  if (!region) {
    console.log('Note: no --region given — this will print on US Letter. AU/NZ documents need --region APAC (A4).\n');
  } else if (region !== 'APAC') {
    console.log('Note: region "' + region + '" is not APAC, so the document prints on US Letter.\n');
  }

  targets.forEach((key) => {
    const { content, stats } = splitPersona(master, key, personas[key], { role, detail, region });
    const out =
      arg('--out', null) ||
      path.join('output', slug(content.processName || 'SOP') + '_' + slug(key) + '_' + detail + '.json');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(content, null, 2));

    console.log('Wrote ' + out);
    console.log('  persona   : ' + key + ' — ' + (personas[key].label || ''));
    console.log('  permitted : ' +
      stats.permitted.steps + '/' + stats.lib.steps + ' steps · ' +
      stats.permitted.checklist + '/' + stats.lib.checklist + ' checklist · ' +
      stats.permitted.issues + '/' + stats.lib.issues + ' issues');
    console.log('  access    : ' + (content.access && content.access.level ? content.access.level : 'MISSING — Section 1 will be blank'));
    if (role) {
      console.log('  role      : ' + role + ' — kept ' + content.steps.length + ' of the ' + stats.permitted.steps + ' permitted steps');
      stats.roleDropped.steps.forEach((s) => console.log('      dropped step      : ' + s));
      stats.roleDropped.checklist.forEach((s) => console.log('      dropped checklist : ' + s));
      if (stats.roleDropped.steps.length || stats.roleDropped.checklist.length) {
        console.log('      ^ permitted content this reader will NOT see. Confirm that is intended.');
      }
    }
    stats.warnings.forEach((w) => console.log('  WARNING   : ' + w));
  });

  console.log('\nStill needs a human before this goes to a client:');
  console.log('  · cover fields (customer, process owner, effective date, approvals) — blank renders as a placeholder');
  console.log('  · subtitle naming the persona explicitly, per the framework standard');
  console.log('  · every [bracketed] placeholder replaced with the client value');
  if (detail === 'extended') console.log('  · extended detail needs authored bullets/callouts — this script never writes content');
}

main();
