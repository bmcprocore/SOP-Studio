// Dev helper: drive the app end-to-end in a real browser — seed the library, pick the
// template, walk the gates and render — to confirm the workflow still produces pages.
const puppeteer = require('puppeteer');
const path = require('path');
const { pathToFileURL } = require('url');

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.setViewport({ width: 1500, height: 860, deviceScaleFactor: 1.25 });
  await page.goto(pathToFileURL(path.resolve('app/SOP_Studio_v0.1.html')).href, { waitUntil: 'networkidle0' });
  await wait(1500);

  const step = async (label, fn) => {
    try { await fn(); await wait(600); console.log('  ok   ' + label); }
    catch (e) { console.log('  FAIL ' + label + ' — ' + e.message); }
  };

  await step('seed the shared library', () => page.click('#btnSeed'));
  await step('open Create', () => page.click('.rail .gate[data-p="create"]'));
  await step('choose "From template"', () =>
    page.evaluate(() => {
      const b = [...document.querySelectorAll('#p-create .seg button')].find((x) => /template/i.test(x.textContent));
      if (!b) throw new Error('no "From template" button'); b.click();
    }));
  await step('select the seeded template', () =>
    page.evaluate(() => {
      const t = document.querySelector('#createTemplate .tpl') || document.querySelector('.tpl');
      if (!t) throw new Error('no template row rendered'); t.click();
    }));
  await step('open Client & Review', () => page.click('.rail .gate[data-p="clientreview"]'));
  await step('open Generate', () => page.click('.rail .gate[data-p="generate"]'));
  await step('render', () => page.click('#btnRender2'));
  await wait(1800);

  const result = await page.evaluate(() => {
    const f = document.getElementById('frame');
    const d = f && f.contentDocument;
    return {
      previewVisible: !document.body.classList.contains('no-preview'),
      pagesRendered: d ? d.querySelectorAll('#viewer .page').length : 0,
      status: (document.getElementById('genStatus') || {}).textContent || '',
      downloadEnabled: !(document.getElementById('btnDownload') || {}).disabled,
    };
  });
  console.log('\nResult: ' + JSON.stringify(result, null, 2));
  await page.screenshot({ path: 'output/flow-rendered.png' });
  console.log(errors.length ? '\nConsole errors:\n  ' + errors.join('\n  ') : '\nNo console errors.');
  await browser.close();
})();
