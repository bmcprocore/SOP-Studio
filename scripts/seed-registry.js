#!/usr/bin/env node
/**
 * seed-registry.js — build / refresh `templates/_registry.json`, the template gallery index.
 *
 * The registry is the SOURCE OF TRUTH for which Procore tools exist, what they are called for
 * each account type, which permission levels they offer, and — the part that matters — the exact
 * granular permission wording that must appear when that tool's template is chosen.
 *
 * This script MERGES. Everything harvested by hand (granular lists, library links, verification
 * notes) is preserved; re-running only adds tools that are missing and fills blank fields. That
 * matters because Procore adds and renames tools, so this gets re-run, and hand-verified
 * permission data must never be clobbered by a re-run.
 *
 * Usage:
 *   node scripts/seed-registry.js            # merge into templates/_registry.json
 *   node scripts/seed-registry.js --dry-run  # report what would change, write nothing
 */
const fs = require('fs');
const path = require('path');

const OUT = path.join('templates', '_registry.json');
const MATRIX = 'https://v2.support.procore.com/process-guides/permissions-matrix/';
const FAQ = 'https://support.procore.com/faq/';

// Procore renames tools by ACCOUNT TYPE ("Point-of-View Dictionaries") and again by REGION.
// General contractor is Procore's base wording. Only tool-name-level renames belong here —
// prose-level term swaps stay in the app's DICTIONARY.
const ACCOUNT_RENAME = {
  OWNER: { 'Prime Contracts': 'Funding', 'Change Orders': 'Funding Change Orders' },
  SPECIALTY: { 'Prime Contracts': 'Client Contracts', 'Change Orders': 'Client Contract Change Orders', Invoicing: 'Progress Billings' },
};
// en-au.support.procore.com wording, verified 27 Aug 2026.
const APAC_RENAME = {
  'Prime Contracts': 'Head Contracts',
  'Change Orders': 'Variations',
  'Punch List': 'Defect List',
  'Daily Log': 'Site Diary',
  Invoicing: 'Progress Claims',
};

// [name, slug, category]. Captured from the permissions-matrix index, 27 Aug 2026.
const COMPANY = [
  ['360 Reporting - 360 Reports', 'company-permissions-360-reporting-360-reports', 'Core'],
  ['360 Reporting - Single Tool Reports', 'company-permissions-360-reporting-single-tool-reports', 'Core'],
  ['Admin', 'company-level-admin-permissions', 'Core'],
  ['Assets', 'project-level-assets-permissions', 'Resource Management'],
  ['Bid Board / Portfolio Planning', 'company-level-bid-board-permissions', 'Preconstruction'],
  ['Conversations', 'company-level-conversations-permissions', 'Core'],
  ['Cost Catalog', 'company-level-cost-catalog-permissions', 'Financial Management'],
  ['Directory', 'company-level-directory-permissions', 'Core'],
  ['Documents', 'company-level-documents-permissions', 'Core'],
  ['Equipment', 'company-level-equipment-permissions', 'Resource Management'],
  ['ERP Integrations', 'company-level-erp-integrations-permissions', 'Financial Management'],
  ['Free Procore Accounts', 'free-procore-accounts-permissions', 'Core'],
  ['Insights', 'insights', 'Core'],
  ['Inspections', 'company-level-inspections-permissions', 'Project Management'],
  ['Permissions', 'company-level-permissions-permissions', 'Core'],
  ['Planroom', 'company-level-planroom-permissions', 'Preconstruction'],
  ['Portfolio', 'company-level-portfolio-permissions', 'Core'],
  ['Prequalification Portal', 'company-level-prequalification-portal-permissions', 'Preconstruction'],
  ['Prequalifications', 'company-level-prequalifications-permissions', 'Preconstruction'],
  ['Programs', 'company-level-programs-permissions', 'Core'],
  ['Rates', 'company-level-rates-permissions', 'Financial Management'],
  ['Resource Planning', 'company-level-resource-planning-permissions', 'Resource Management'],
  ['Schedule', 'company-level-schedule-permissions', 'Project Management'],
  ['Timecard', 'company-level-timecard-permissions', 'Resource Management'],
  ['Timesheets', 'company-level-timesheets-permissions', 'Resource Management'],
  ['Webhooks', 'webhooks-company', 'Core'],
  ['Workflows', 'company-level-workflows-permissions', 'Core'],
];
const PROJECT = [
  ['360 Reporting - 360 Reports', 'project-level-360-reporting-permissions-360-reports', 'Core'],
  ['360 Reporting - Single Tool Reports', 'project-level-360-reporting-permissions-single-tool-reports', 'Core'],
  ['Action Plans', 'project-level-action-plans-permissions', 'Project Management'],
  ['Admin', 'project-level-admin-permissions', 'Core'],
  ['Announcements', 'mobile-announcements-permissions', 'Core'],
  ['Assets', 'project-level-assets-permissions', 'Resource Management'],
  ['Bidding', 'project-level-bidding-permissions', 'Preconstruction'],
  ['Budget', 'project-level-budget-permissions', 'Financial Management'],
  ['Change Events', 'project-level-change-events-permissions', 'Financial Management'],
  ['Change Orders', 'project-level-change-orders-permissions', 'Financial Management'],
  ['Commitments', 'project-level-commitments-permissions', 'Financial Management'],
  ['Connection Manager', 'project-level-connection-manager-permissions', 'Core'],
  ['Coordination Issues', 'project-level-coordination-issues-permissions', 'Project Management'],
  ['Correspondence', 'project-level-correspondence-permissions', 'Project Management'],
  ['Crews', 'project-level-crews-permissions', 'Resource Management'],
  ['Daily Log', 'project-level-daily-log-permissions', 'Project Management'],
  ['Data Extracts 2.0', 'project-level-data-extracts-2.0-permissions', 'Core'],
  ['Direct Costs', 'project-level-direct-costs-permissions', 'Financial Management'],
  ['Directory', 'project-level-directory-permissions', 'Core'],
  ['Documents', 'project-level-documents-permissions', 'Core'],
  ['Drawings', 'project-level-drawings-permissions', 'Project Management'],
  ['Emails', 'project-level-emails-permissions', 'Project Management'],
  ['Equipment', 'project-level-equipment-permissions', 'Resource Management'],
  ['Estimating', 'project-level-estimating-permissions', 'Preconstruction'],
  ['Forms', 'project-level-forms-permissions', 'Project Management'],
  ['Home', 'project-level-home-permissions', 'Core'],
  ['Incidents', 'project-level-incidents-permissions', 'Project Management'],
  ['Inspections', 'project-level-inspections-permissions', 'Project Management'],
  ['Instructions', 'project-level-instructions-permissions', 'Project Management'],
  ['Invoicing', 'project-level-invoicing-permissions', 'Financial Management'],
  ['Locations', 'mobile-locations-permissions', 'Core'],
  ['Materials', 'project-level-materials-permissions', 'Resource Management'],
  ['Meetings', 'project-level-meetings-permissions', 'Project Management'],
  ['Models', 'project-level-models-permissions', 'Project Management'],
  ['My Time', 'mobile-my-time-permissions', 'Resource Management'],
  ['Observations', 'project-level-observations-permissions', 'Project Management'],
  ['Photos', 'project-level-photos-permissions', 'Project Management'],
  ['Prime Contracts', 'project-level-prime-contracts-permissions', 'Financial Management'],
  ['Procore Mobile App (General)', 'general-mobile', 'Core'],
  ['Project Dashboard', 'mobile-project-dashboard-permissions', 'Core'],
  ['Project Overview', 'project-overview-permissions', 'Core'],
  ['Punch List', 'project-level-punch-list-permissions', 'Project Management'],
  ['Rates', 'project-level-rates-permissions', 'Financial Management'],
  ['RFIs', 'project-level-rfis-permissions', 'Project Management'],
  ['Schedule', 'project-level-schedule-permissions', 'Project Management'],
  ['Scheduling', 'project-level-scheduling-permissions', 'Project Management'],
  ['Specifications', 'project-level-specifications-permissions', 'Project Management'],
  ['Submittals', 'project-level-submittals-permissions', 'Project Management'],
  ['Tasks', 'project-level-tasks-permissions', 'Core'],
  ['Timesheets', 'project-level-timesheets-permissions', 'Resource Management'],
  ['T&M Tickets', 'project-level-tmtickets-permissions', 'Financial Management'],
  ['Transmittals', 'project-level-transmittals-permissions', 'Project Management'],
  ['Webhooks', 'webhooks-project-permissions', 'Core'],
];

const slugId = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const faqSlug = (name) => slugId(name);

function blank(name, slug, category, level) {
  const id = level + '-' + slugId(name);
  const names = { GC: name };
  ['OWNER', 'SPECIALTY'].forEach((a) => { names[a] = (ACCOUNT_RENAME[a] || {})[name] || name; });
  return {
    id,
    tool: name,
    level,                       // "project" | "company"
    category,
    names,                       // what each account type calls it
    nameAPAC: APAC_RENAME[name] || name,
    levelsOffered: [],           // [] = not yet confirmed against the matrix page
    granular: [],                // [] = not yet harvested. null after confirming none exist.
    granularStatus: 'not-harvested',
    sources: {
      matrix: MATRIX + slug,
      granularFaq: FAQ + 'what-granular-permissions-are-available-for-the-' +
        (level === 'project' ? 'projects-' : 'companys-') + faqSlug(name) + '-tool',
    },
    library: null,               // path to the master content library, once one exists
    libraryStatus: 'none',       // none | ai-draft | verified
    notes: '',
  };
}

function main() {
  const dry = process.argv.includes('--dry-run');
  const existing = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : null;
  const byId = new Map((existing?.tools || []).map((t) => [t.id, t]));

  const seeded = [
    ...PROJECT.map(([n, s, c]) => blank(n, s, c, 'project')),
    ...COMPANY.map(([n, s, c]) => blank(n, s, c, 'company')),
  ];

  let added = 0, kept = 0;
  const tools = seeded.map((fresh) => {
    const prior = byId.get(fresh.id);
    if (!prior) { added++; return fresh; }
    kept++;
    // Merge: anything a human harvested wins over the blank seed.
    return {
      ...fresh,
      ...prior,
      names: { ...fresh.names, ...(prior.names || {}) },
      sources: { ...fresh.sources, ...(prior.sources || {}) },
    };
  });
  byId.forEach((t, id) => {
    if (!seeded.some((s) => s.id === id)) {
      tools.push({ ...t, notes: (t.notes ? t.notes + ' ' : '') + '[not in the 27 Aug 2026 matrix index — check whether Procore removed or renamed it]' });
    }
  });

  const out = {
    _registry: 'Procore tool registry — the template gallery index',
    _version: existing?._version || '0.1',
    _status: 'AI-DRAFT — tool list and granular wording harvested from Procore support documentation. ' +
      'Tool availability and granular options vary by company configuration. Verify against the ' +
      'client\'s own permission template before any client release.',
    _updated: new Date().toISOString().slice(0, 10),
    _sources: {
      matrixIndex: MATRIX,
      granularFaqPattern: FAQ + 'what-granular-permissions-are-available-for-the-projects-<tool>-tool',
      apacNaming: 'https://en-au.support.procore.com/references/user-permissions-matrix-web',
      liveInstanceCapture: 'docs/procore-permission-reference.md',
    },
    _howToUse: 'Pick a tool -> its `granular` array is what the Studio offers once that template is ' +
      'chosen. `levelsOffered` is which of the four base levels that tool actually exposes. ' +
      '`library` points at the master content library, if one has been authored yet. ' +
      'Account-type naming comes from `names`; APAC naming from `nameAPAC`.',
    accountTypes: ['GC', 'OWNER', 'SPECIALTY'],
    detailLevels: ['simple', 'standard', 'extended'],
    permissionLevels: ['None', 'Read Only', 'Standard', 'Admin'],
    tools,
  };

  const counts = {
    total: tools.length,
    withGranular: tools.filter((t) => (t.granular || []).length).length,
    granularHarvested: tools.filter((t) => t.granularStatus !== 'not-harvested').length,
    withLibrary: tools.filter((t) => t.library).length,
  };

  console.log((dry ? '[dry run] ' : '') + 'Registry: ' + counts.total + ' tools (' + added + ' new, ' + kept + ' merged)');
  console.log('  granular harvested : ' + counts.granularHarvested + '/' + counts.total);
  console.log('  content library    : ' + counts.withLibrary + '/' + counts.total);
  if (dry) return;
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log('Wrote ' + OUT);
}

main();
