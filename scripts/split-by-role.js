#!/usr/bin/env node
/**
 * split-by-role.js — produce a role-specific SOP content JSON from a master library.
 *
 * The master library tags every step with the job role that performs it. This filters the
 * master down to one role's steps, keeping shared steps everyone performs, and sets the
 * detail level. It only ever removes content — nothing is invented or rewritten.
 *
 * Usage:
 *   node scripts/split-by-role.js <master.json> --list
 *   node scripts/split-by-role.js <master.json> --role "RFI Manager" [--detail simple|standard|extended]
 *   node scripts/split-by-role.js <master.json> --all [--detail ...]
 *
 * Output: output/<Process>_<Role>_<detail>.json  (override with --out)
 */
const fs = require('fs');
const path = require('path');

// Steps tagged with one of these belong in every role's guide.
const SHARED_ROLES = ['all users', 'all', 'everyone', 'any user'];
// Keys that exist only on a master library and must not reach the renderer.
const MASTER_ONLY = ['_library', '_how_to_use', '_personas'];

const isShared = (role) => SHARED_ROLES.includes(String(role || '').trim().toLowerCase());
const slug = (s) => String(s || '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');

function rolesIn(master) {
  const seen = [];
  (master.steps || []).forEach((s) => {
    const r = (s.role || '').trim();
    if (r && !isShared(r) && !seen.includes(r)) seen.push(r);
  });
  return seen;
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

function splitRole(master, role, detail) {
  const c = JSON.parse(JSON.stringify(master));
  MASTER_ONLY.forEach((k) => delete c[k]);

  const before = (c.steps || []).length;
  c.steps = (c.steps || []).filter((s) => s.role === role || isShared(s.role));

  // Checklist: keep items owned by this role, items with no owner, and shared items.
  const owns = (o) => {
    const a = String(o || '').trim().toLowerCase();
    if (!a) return true;
    const b = role.toLowerCase();
    return a === b || b.includes(a) || a.includes(b) || isShared(o);
  };
  const checkBefore = (c.checklist || []).length;
  c.checklist = (c.checklist || []).filter((it) => owns(it.owner));

  c._detail = detail;
  c._role = role;
  c.status = 'draft';
  if (c.docId) c.docId = String(c.docId) + '-' + slug(role).toUpperCase().slice(0, 12);

  if (detail === 'simple') applySimple(c);

  return {
    content: c,
    stats: {
      stepsKept: c.steps.length,
      stepsDropped: before - c.steps.length,
      checklistKept: c.checklist.length,
      checklistDropped: checkBefore - c.checklist.length,
    },
  };
}

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
    ? process.argv[i + 1]
    : fallback;
}

function main() {
  const src = process.argv[2];
  if (!src || src.startsWith('--')) {
    console.error('Usage: node scripts/split-by-role.js <master.json> --list | --role "<Role>" | --all [--detail simple|standard|extended]');
    process.exit(1);
  }
  const master = JSON.parse(fs.readFileSync(src, 'utf8'));
  const available = rolesIn(master);

  if (process.argv.includes('--list')) {
    console.log('Roles in ' + path.basename(src) + ':');
    available.forEach((r) => {
      const n = (master.steps || []).filter((s) => s.role === r).length;
      console.log('  ' + r.padEnd(28) + n + ' step' + (n === 1 ? '' : 's'));
    });
    const shared = (master.steps || []).filter((s) => isShared(s.role)).length;
    if (shared) console.log('  ' + '(shared — in every guide)'.padEnd(28) + shared + ' steps');
    return;
  }

  const detail = arg('--detail', 'standard');
  if (!['simple', 'standard', 'extended'].includes(detail)) {
    console.error('--detail must be simple, standard or extended');
    process.exit(1);
  }

  const targets = process.argv.includes('--all') ? available : [arg('--role', null)];
  if (!targets[0]) {
    console.error('Specify --role "<Role>" or --all. Available: ' + available.join(' | '));
    process.exit(1);
  }

  targets.forEach((role) => {
    if (!available.includes(role)) {
      console.error('Unknown role "' + role + '". Available: ' + available.join(' | '));
      process.exit(1);
    }
    const { content, stats } = splitRole(master, role, detail);
    const out =
      arg('--out', null) ||
      path.join('output', slug(content.processName || 'SOP') + '_' + slug(role) + '_' + detail + '.json');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(content, null, 2));
    console.log(
      'Wrote ' + out +
      '  (' + stats.stepsKept + ' steps kept, ' + stats.stepsDropped + ' dropped; ' +
      stats.checklistKept + ' checklist kept, ' + stats.checklistDropped + ' dropped)'
    );
  });

  console.log('\nStill needs a human before this goes to a client:');
  console.log('  · cover fields (customer, process owner, effective date, approvals) — blank renders as a placeholder');
  console.log('  · subtitle naming the role explicitly, per the framework standard');
  if (detail === 'extended') console.log('  · extended detail needs authored bullets/callouts — this script never writes content');
}

main();
