#!/usr/bin/env node
/**
 * seed-library.js — turn a harvested permissions matrix into a master-library SEED.
 *
 * WHAT THIS IS: every action Procore documents for a tool, carrying the permission level that
 * allows it and any granular permission that gates it, arranged in the master-library shape with
 * the four personas already filtered. Derived from Procore's own matrix — nothing is invented.
 *
 * WHAT THIS IS NOT: an authored process. The candidate steps are Procore's action names, not a
 * client's workflow, and every `body` is empty on purpose. A human selects, orders, merges and
 * writes them. A seed must never go to a client.
 *
 * The immediate value is the answer to "what can this permission level actually do in this tool",
 * straight from Procore, per persona.
 *
 * Usage:
 *   node scripts/seed-library.js --tool project-rfis [--out <path>]
 *   node scripts/seed-library.js --all
 */
const fs = require('fs');
const path = require('path');

const REGISTRY = path.join('templates', '_registry.json');
const MATRIX = path.join('docs', 'reference', 'matrix');
const ORDER = ['Read Only', 'Standard', 'Admin'];
const PERM_KEY = { 'Read Only': 'ReadOnly', Standard: 'Standard', Admin: 'Admin' };

const pad = (n) => String(n).padStart(2, '0');
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const atLeast = (min, level) => ORDER.indexOf(level) >= ORDER.indexOf(min);

function personaFor(level, tool, granularNames) {
  const meaningLevel = {
    'Read Only': 'view',
    Standard: 'create and work on your own items in',
    Admin: 'fully control, including configuring,',
  }[level];
  return {
    label: level + ' · ' + tool,
    permission: level + ' (' + tool + ')',
    cannot_do: '',
    access: {
      tool,
      level,
      // Deliberately generic and clearly provisional — a human writes the real sentence.
      levelMeaning: '',
      _levelMeaningHint: 'You can ' + meaningLevel + ' ' + tool + '. Rewrite this in the client\'s own terms before release.',
      granular: granularNames.map((n) => ({ name: n, meaning: '' })),
      notIncluded: [],
    },
  };
}

function seed(reg, m) {
  const t = reg.tools.find((x) => x.id === m.id);
  const tool = t ? t.tool : m.tool;
  const levels = (m.levelsOffered || []).filter((l) => l !== 'None');

  // Candidate steps, in the order Procore lists them.
  const steps = [];
  m.actions.forEach((a, i) => {
    if (!a.minLevel) return;                       // no level allows it — nothing to scope
    const gates = a.granularBy ? Object.values(a.granularBy)[0] : null;
    const step = {
      _id: 'S' + pad(steps.length + 1),
      _perm: { min: PERM_KEY[a.minLevel] || a.minLevel },
      _candidate: true,
      _source: m.source,
      _platforms: a.platforms,
      title: a.action,
      role: '',
      system: 'Procore · ' + tool,
      body: '',
    };
    if (gates && gates.permissions.length) {
      step._perm.granular = gates.permissions.length === 1 ? gates.permissions[0] : gates.permissions;
      if (gates.anyOf) step._perm.granularAnyOf = true;
    }
    steps.push(step);
  });

  const granularNames = [...new Set(steps.flatMap((s) => [].concat(s._perm.granular || [])))].sort();

  // Personas: one per level the tool actually offers, filtered by permission.
  const personas = {};
  levels.forEach((level, i) => {
    const key = 'P' + (i + 1) + '_' + slug(level);
    const ids = steps.filter((s) => {
      const min = Object.keys(PERM_KEY).find((k) => PERM_KEY[k] === s._perm.min) || s._perm.min;
      return atLeast(min, level);
    }).map((s) => s._id);
    personas[key] = { ...personaFor(level, tool, level === 'Admin' ? [] : granularNames), steps: ids, checklist: [], issues: [] };
  });

  return {
    _library: 'Procore ' + tool + ' — master content library (SEED)',
    _version: '0.1-seed',
    _status: 'SEED — NOT AN SOP. Candidate actions transcribed from Procore\'s User Permissions Matrix on ' +
      m.harvested + '. Permission tags are Procore\'s; every step body is empty and every persona ' +
      'statement is blank because nothing here has been authored. A human must select, order and ' +
      'write these steps against a client process before this becomes a library. Never issue a seed.',
    _seededFrom: { matrix: m.source, harvested: m.harvested, actions: m.actions.length, kept: steps.length },
    _how_to_use: 'Delete the actions that are not part of this client\'s process, merge the ones that ' +
      'are really a single step, order them into the real workflow, write each body, then fill the ' +
      'persona access objects and cannot_do statements. Renumber _id only once, then keep them stable. ' +
      'Remove `_candidate` from a step once it has been authored.',
    _personas: personas,
    docId: '', version: '1.0', status: 'draft', customer: '',
    processName: tool + ' management', subtitle: '', processOwner: '', effectiveFrom: '', appliesTo: '',
    approvals: { preparedBy: { name: '', date: '' }, reviewedBy: { name: '', date: '' }, approvedBy: { name: '', date: '' }, scheduledReview: { name: '', date: '' } },
    purpose: '',
    phases: [{ name: '', desc: '' }, { name: '', desc: '' }, { name: '', desc: '' }, { name: '', desc: '' }],
    procedureIntro: '',
    referenceTool: 'Procore · ' + tool,
    steps,
    closeoutIntro: '', owner: '', checklist: [], issues: [],
    references: [{ tool: tool + ' — user permissions matrix', url: m.source }],
  };
}

function arg(flag, fb) {
  const i = process.argv.indexOf(flag);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : fb;
}

function main() {
  const reg = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
  const one = arg('--tool', null);
  let files;
  if (one) files = one.split(',').map((s) => path.join(MATRIX, s.trim() + '.json'));
  else if (process.argv.includes('--all')) files = fs.readdirSync(MATRIX).filter((f) => f.endsWith('.json')).map((f) => path.join(MATRIX, f));
  else { console.error('Specify --tool <id>[,<id>...] or --all'); process.exit(1); }

  const MATRIX_SRC = 'permissions-matrix-' + new Date().toISOString().slice(0, 10);
  let aliasesAdded = 0;

  files.forEach((f) => {
    if (!fs.existsSync(f)) { console.log('  no harvest for ' + f + ' — run harvest-matrix.js first'); return; }
    const m = JSON.parse(fs.readFileSync(f, 'utf8'));
    const lib = seed(reg, m);
    const dir = path.join('templates', slug(m.tool));
    const out = arg('--out', null) || path.join(dir, 'master-library-v0.1-seed.json');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(lib, null, 2));
    const perPersona = Object.entries(lib._personas).map(([k, p]) => k.split('_')[0] + '=' + p.steps.length).join(' ');
    console.log('  ' + m.id.padEnd(30) + lib.steps.length + ' candidate steps  [' + perPersona + ']  -> ' + out);

    // Keep the gallery honest: record what the matrix confirmed for this tool.
    const t = reg.tools.find((x) => x.id === m.id);
    if (!t) return;
    t.levelsOffered = m.levelsOffered;
    if (!t.library) { t.library = out.replace(/\\/g, '/'); t.libraryStatus = 'seed'; }

    // Procore words the same granular permission differently across its own pages (FAQ, matrix,
    // and a live instance's regional vocabulary). Record every variant against one entry rather
    // than pretending a single canonical string exists.
    const norm = (s) => s.toLowerCase().replace(/\b(the|to|with|a|an|of)\b/g, ' ')
      .replace(/\bpunch\b/g, 'defect').replace(/\bitems?\b/g, 'item').replace(/[^a-z0-9]+/g, ' ').trim();
    const fromMatrix = [...new Set(lib.steps.flatMap((s) => [].concat(s._perm.granular || [])))];
    fromMatrix.forEach((name) => {
      const hit = (t.granular || []).find((g) => norm(g.name) === norm(name) ||
        (g.aliases || []).some((a) => norm(a.text) === norm(name)));
      if (hit) {
        if (norm(hit.name) !== norm(name) || hit.name !== name) {
          hit.aliases = hit.aliases || [];
          if (!hit.aliases.some((a) => a.text === name)) { hit.aliases.push({ text: name, source: MATRIX_SRC }); aliasesAdded++; }
        }
      } else {
        t.granular = t.granular || [];
        t.granular.push({ name, appliesTo: [], meaning: '', source: MATRIX_SRC });
        aliasesAdded++;
      }
    });
    if (t.granularStatus === 'not-harvested' && (t.granular || []).length) t.granularStatus = 'capture-only';
  });

  fs.writeFileSync(REGISTRY, JSON.stringify(reg, null, 2));
  console.log('\nRegistry updated: levels confirmed, seeds linked, ' + aliasesAdded + ' granular name variant(s) recorded.');
  console.log('Seeds are candidate actions, not authored SOPs. Nothing here may be issued to a client.');
}

main();
