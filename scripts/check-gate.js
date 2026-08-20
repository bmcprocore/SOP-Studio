// Dev helper: prove Gate 3 cannot be bypassed, and that the permission rule really filters.
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

  await page.setViewport({ width: 1500, height: 900, deviceScaleFactor: 1.2 });
  await page.goto(pathToFileURL(path.resolve('app/SOP_Studio_v0.1.html')).href, { waitUntil: 'networkidle0' });
  await wait(1400);

  const pickTemplate = async () => {
    await page.click('#btnSeed'); await wait(500);
    await page.click('.rail .gate[data-p="create"]'); await wait(300);
    await page.evaluate(() => { const t = document.querySelector('#createTplList .tpl') || document.querySelector('.tpl'); t && t.click(); });
    await wait(600);
  };
  const setLevel = async (v) => {
    await page.click('.rail .gate[data-p="permissions"]'); await wait(250);
    await page.click('#permSeg button[data-v="' + v + '"]'); await wait(450);
  };
  const counts = () => page.evaluate(() => {
    const t = document.getElementById('tallyBox');
    const nums = t ? [...t.querySelectorAll('b')].map((b) => +b.textContent) : [];
    return { included: nums[0], dropped: nums[1], needDecision: nums[2] };
  });
  const rendered = () => page.evaluate(() => {
    const d = document.getElementById('frame').contentDocument;
    return {
      pages: d ? d.querySelectorAll('#viewer .page').length : 0,
      renderDisabled: document.getElementById('btnRender2').disabled,
      downloadDisabled: document.getElementById('btnDownload').disabled,
      status: (document.getElementById('genStatus') || {}).textContent.trim().slice(0, 90),
    };
  });

  console.log('TEST 1 — try to generate without confirming (the old bypass)');
  await pickTemplate();
  await page.click('.rail .gate[data-p="generate"]'); await wait(300);
  await page.evaluate(() => document.getElementById('btnRender2').click());
  await wait(1200);
  console.log('  ' + JSON.stringify(await rendered()));

  console.log('\nTEST 2 — permission rule actually filters');
  for (const lvl of ['ReadOnly', 'Standard', 'Admin']) {
    await setLevel(lvl);
    await page.click('.rail .gate[data-p="review"]'); await wait(400);
    console.log('  ' + lvl.padEnd(9) + ' ' + JSON.stringify(await counts()));
  }

  console.log('\nTEST 3 — granular permission changes the outcome');
  await setLevel('Standard');
  await page.evaluate(() => { const cb = document.querySelector('#granList input[type=checkbox]'); cb && cb.click(); });
  await wait(500);
  await page.click('.rail .gate[data-p="review"]'); await wait(400);
  console.log('  Standard + granular ' + JSON.stringify(await counts()));

  console.log('\nTEST 4 — confirm, then generate');
  await page.evaluate(() => { const i = document.getElementById('fConfirmBy'); if (i) { i.value = 'B. McGurk'; i.dispatchEvent(new Event('input', { bubbles: true })); } });
  await page.evaluate(() => document.getElementById('btnConfirm').click());
  await wait(400);
  await page.click('.rail .gate[data-p="generate"]'); await wait(300);
  await page.evaluate(() => document.getElementById('btnRender2').click());
  await wait(2400);
  console.log('  ' + JSON.stringify(await rendered()));

  console.log('\nTEST 5 — changing permissions after confirming re-locks it');
  await setLevel('Admin');
  await page.click('.rail .gate[data-p="generate"]'); await wait(300);
  console.log('  ' + JSON.stringify(await rendered()));

  const audit = await page.evaluate(() => {
    const ta = document.getElementById('sopJson');
    return ta ? (ta.value.match(/_confirmedBy[^,]*/) || ['(not in JSON)'])[0] : '(no editor)';
  });
  console.log('\nAudit trail in content JSON: ' + audit);
  console.log(errs.length ? '\nERRORS:\n  ' + errs.join('\n  ') : '\nNo console errors.');
  await page.screenshot({ path: 'output/gate-review.png' });
  await browser.close();
})();
