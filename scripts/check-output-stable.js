/**
 * check-output-stable.js — guard the document itself.
 *
 * The rule for this project is that the tool may change but the PDF must not. Nothing enforced
 * that. This renders a fixed document from a fixed template and compares its structure against a
 * stored baseline: page count, every heading, the page furniture, and the brand tokens.
 *
 *   node scripts/check-output-stable.js            # compare against the baseline
 *   node scripts/check-output-stable.js --accept   # record the current output as the new baseline
 *
 * Run --accept only when a change to the document is intended and versioned.
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const BASELINE = path.join(__dirname, '..', 'docs', 'reference', 'output-baseline.json');
const ACCEPT = process.argv.includes('--accept');

/** The locked design exists twice — inside the app and in design/. They were byte-identical when
 *  this check was written, and the seed template proved that two copies of the same thing WILL
 *  drift if nothing watches them. */
function designCopiesMatch() {
  const grab = (f) => {
    const h = fs.readFileSync(f, 'utf8');
    const i = h.indexOf('css: "');
    if (i < 0) return null;
    return h.slice(i, h.indexOf('\n', h.indexOf('@media print', i)));
  };
  const a = grab(path.join(__dirname, '..', 'app', 'SOP_Studio_v0.1.html'));
  const d = grab(path.join(__dirname, '..', 'design', 'SOP_Builder_step_per_page_v2.html'));
  if (!a || !d) return 'Could not read one of the two design copies.';
  if (a !== d) return 'The two copies of the locked design have drifted apart (' + a.length + ' vs ' + d.length + ' characters). The app and the standalone renderer will now produce different documents.';
  return null;
}

(async () => {
  const drift = designCopiesMatch();
  if (drift) { console.error('DESIGN DRIFT\n  ' + drift); process.exit(1); }
  const b = await puppeteer.launch({ headless: 'new' });
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  await p.setViewport({ width: 1600, height: 1000 });
  await p.goto(pathToFileURL(path.resolve('app/SOP_Studio_v0.1.html')).href, { waitUntil: 'networkidle0' });
  await wait(1500);

  // a fixed, reproducible document — no dates, no free text
  await p.click('#btnSeed'); await wait(450);
  await p.click('.rail .gate[data-p="create"]'); await wait(250);
  await p.evaluate(() => document.querySelector('#createTplList .tpl').click()); await wait(650);
  await p.click('.rail .gate[data-p="permissions"]'); await wait(240);
  await p.click('#permSeg button[data-v="Standard"]'); await wait(400);
  await p.click('.rail .gate[data-p="details"]'); await wait(240);
  await p.evaluate(() => {
    const set = (id, v) => { const e = document.getElementById(id); if (e) { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); } };
    set('fCustomer', 'Baseline Client'); set('fDocId', 'SOP-BASE-001'); set('fVersion', '1.0');
    set('fOwner', 'A. Owner'); set('fAppliesTo', 'All projects');
  });
  await wait(400);
  await p.click('.rail .gate[data-p="review"]'); await wait(420);
  await p.evaluate(() => { const i = document.getElementById('fConfirmBy'); i.value = 'Baseline'; i.dispatchEvent(new Event('input', { bubbles: true })); });
  await p.evaluate(() => document.getElementById('btnConfirm').click()); await wait(400);
  await p.click('.rail .gate[data-p="generate"]'); await wait(250);
  await p.evaluate(() => document.getElementById('btnRender2').click()); await wait(2800);

  const shape = await p.evaluate(() => {
    const d = document.getElementById('frame').contentDocument;
    const pages = [...d.querySelectorAll('#viewer .page')];
    const css = (sel, prop) => {
      const el = d.querySelector(sel);
      return el ? getComputedStyle(el)[prop] : null;
    };
    return {
      pageCount: pages.length,
      // structure: what each page carries, ignoring dates and other volatile values
      headings: [...d.querySelectorAll('#viewer h1.section-title, #viewer h2.subhead')].map((h) => h.textContent.trim()),
      stepTitles: [...d.querySelectorAll('#viewer .step .step-title')].map((h) => h.textContent.trim()),
      furniture: {
        headersPerDoc: d.querySelectorAll('#viewer .pg-header').length,
        footersPerDoc: d.querySelectorAll('#viewer .pg-footer').length,
        pageNumbers: [...d.querySelectorAll('#viewer .pg-footer .pageno')].map((n) => n.textContent.trim()),
      },
      // Procore branding must not drift
      brand: {
        accent: css('#viewer .section-eyebrow', 'color'),
        ink: css('#viewer h1.section-title', 'color'),
        displayFont: (css('#viewer h1.section-title', 'fontFamily') || '').split(',')[0].replace(/"/g, ''),
        wordmarkPresent: !!d.querySelector('#viewer .pg-header svg'),
        pageWidth: Math.round(pages[0].getBoundingClientRect().width),
        pageHeight: Math.round(pages[0].getBoundingClientRect().height),
      },
      // nothing may run off the bottom of a page
      overflowingPages: pages.filter((pg) => {
        const bd = pg.querySelector('.pg-body');
        if (!bd) return false;
        const limit = bd.getBoundingClientRect().bottom - (parseFloat(getComputedStyle(bd).paddingBottom) || 0);
        return [...bd.children].some((el) => el.getBoundingClientRect().bottom > limit + 1);
      }).length,
    };
  });
  await b.close();

  if (errs.length) { console.error('Page errors during render:\n  ' + errs.join('\n  ')); process.exit(1); }

  if (ACCEPT || !fs.existsSync(BASELINE)) {
    fs.mkdirSync(path.dirname(BASELINE), { recursive: true });
    fs.writeFileSync(BASELINE, JSON.stringify(shape, null, 2));
    console.log((fs.existsSync(BASELINE) && !ACCEPT ? 'No baseline existed — recorded' : 'Baseline recorded') +
      ': ' + shape.pageCount + ' pages, ' + shape.stepTitles.length + ' steps, ' +
      shape.brand.pageWidth + 'x' + shape.brand.pageHeight + 'px');
    return;
  }

  const base = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
  const diffs = [];
  const cmp = (label, a, c) => {
    const A = JSON.stringify(a), C = JSON.stringify(c);
    if (A !== C) diffs.push('  ' + label + '\n      was: ' + A + '\n      now: ' + C);
  };
  cmp('page count', base.pageCount, shape.pageCount);
  cmp('section headings', base.headings, shape.headings);
  cmp('step titles', base.stepTitles, shape.stepTitles);
  cmp('page furniture', base.furniture, shape.furniture);
  cmp('branding', base.brand, shape.brand);

  if (shape.overflowingPages) {
    diffs.push('  ' + shape.overflowingPages + ' page(s) have content running off the bottom — it will be clipped in the PDF');
  }

  if (!diffs.length) {
    console.log('Document unchanged: ' + shape.pageCount + ' pages, ' + shape.stepTitles.length +
      ' steps, ' + shape.brand.pageWidth + 'x' + shape.brand.pageHeight + 'px, no overflow.');
    return;
  }
  console.error('THE DOCUMENT CHANGED — ' + diffs.length + ' difference(s):\n' + diffs.join('\n'));
  console.error('\nIf the change was intended, version the design and re-run with --accept.');
  process.exit(1);
})();
