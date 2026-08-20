// Dev helper: prove the "also save as a template" tickbox works, persists, carries the
// permission tags, and does NOT carry client-specific facts into the next document.
const puppeteer = require('puppeteer');
const path = require('path');
const { pathToFileURL } = require('url');

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));

  await page.setViewport({ width: 1500, height: 950, deviceScaleFactor: 1.2 });
  const url = pathToFileURL(path.resolve('app/SOP_Studio_v0.1.html')).href;
  await page.goto(url, { waitUntil: 'networkidle0' });
  await wait(1400);

  // build one SOP with real client details
  await page.click('#btnSeed'); await wait(500);
  await page.click('.rail .gate[data-p="create"]'); await wait(300);
  await page.evaluate(() => document.querySelector('#createTplList .tpl').click()); await wait(600);
  await page.click('.rail .gate[data-p="details"]'); await wait(300);
  await page.evaluate(() => {
    const set = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
    set('fCustomer', 'Kingsmede Constructions Pty Ltd');
    set('fDocId', 'SOP-RFI-001'); set('fOwner', 'S. Okafor · Project Manager');
    set('fPrepared', 'B. McGurk'); set('fAppliesTo', 'All ANZ projects');
  });
  await wait(300);
  await page.click('.rail .gate[data-p="review"]'); await wait(400);
  await page.evaluate(() => { const i = document.getElementById('fConfirmBy'); i.value = 'B. McGurk'; i.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.evaluate(() => document.getElementById('btnConfirm').click()); await wait(400);

  await page.click('.rail .gate[data-p="generate"]'); await wait(300);
  console.log('Before ticking: name field visible =', await page.evaluate(() => getComputedStyle(document.getElementById('saveTplRow')).display !== 'none'));

  await page.evaluate(() => document.getElementById('fSaveTpl').click()); await wait(300);
  const prefilled = await page.evaluate(() => ({
    visible: getComputedStyle(document.getElementById('saveTplRow')).display !== 'none',
    name: document.getElementById('fTplName').value,
    hint: document.getElementById('tplNameHint').textContent,
  }));
  console.log('After ticking :', JSON.stringify(prefilled));

  await page.evaluate(() => { const e = document.getElementById('fTplName'); e.value = 'RFIs — Kingsmede variant'; e.dispatchEvent(new Event('input', { bubbles: true })); });
  await wait(200);
  await page.evaluate(() => document.getElementById('btnRender2').click());
  await wait(2600);

  const after = await page.evaluate(() => {
    const d = document.getElementById('frame').contentDocument;
    return {
      pages: d ? d.querySelectorAll('#viewer .page').length : 0,
      status: (document.getElementById('genStatus') || {}).textContent.trim(),
      libraryNames: Object.keys((window.__lib && window.__lib()) || {}),
    };
  });
  console.log('\nRendered pages :', after.pages);
  console.log('Status         :', after.status.slice(0, 190));

  // reload the page — does the saved template survive?
  await page.goto(url, { waitUntil: 'networkidle0' });
  await wait(1500);
  const persisted = await page.evaluate(() => ({
    libStatus: (document.getElementById('libStatus') || {}).textContent.trim(),
    rows: [...document.querySelectorAll('#tplList .tpl .nm')].map((n) => n.textContent),
  }));
  console.log('\nAfter reload   :', JSON.stringify(persisted, null, 2));

  // start a fresh SOP from the saved template and check for client leakage
  await page.click('.rail .gate[data-p="create"]'); await wait(300);
  await page.evaluate(() => {
    const rows = [...document.querySelectorAll('#createTplList .tpl')];
    const t = rows.find((r) => /Kingsmede variant/.test(r.textContent)) || rows[0];
    t.click();
  });
  await wait(700);
  await page.evaluate(() => document.getElementById('btnShowJson') && document.getElementById('btnShowJson').click());
  await page.click('.rail .gate[data-p="review"]'); await wait(500);
  const leak = await page.evaluate(() => {
    const ta = document.getElementById('sopJson');
    const j = ta && ta.value ? JSON.parse(ta.value) : {};
    return {
      customer: j.customer, docId: j.docId, preparedBy: (j.approvals && j.approvals.preparedBy || {}).name,
      steps: (j.steps || []).length,
      firstStepKeepsPermTag: !!((j.steps || [])[0] || {})._perm,
    };
  });
  console.log('\nNew SOP from that template (client fields must be empty):');
  console.log('  ' + JSON.stringify(leak));

  console.log(errs.length ? '\nERRORS:\n  ' + errs.join('\n  ') : '\nNo console errors.');
  await page.screenshot({ path: 'output/save-template.png' });
  await browser.close();
})();
