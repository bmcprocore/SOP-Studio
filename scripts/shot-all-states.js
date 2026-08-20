// Dev helper: capture every screen in a realistic working state for design review.
const puppeteer = require('puppeteer');
const path = require('path');
const { pathToFileURL } = require('url');

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  const notes = [];
  page.on('pageerror', (e) => notes.push('pageerror: ' + e));

  await page.setViewport({ width: 1600, height: 950, deviceScaleFactor: 1.4 });
  await page.goto(pathToFileURL(path.resolve('app/SOP_Studio_v0.1.html')).href, { waitUntil: 'networkidle0' });
  await wait(1400);

  const shot = async (name) => { await page.screenshot({ path: 'output/ux-' + name + '.png' }); console.log('  captured ' + name); };

  await shot('01-templates-empty');

  await page.click('#btnSeed'); await wait(600);
  await shot('02-templates-seeded');

  await page.click('.rail .gate[data-p="create"]'); await wait(400);
  await shot('03-create-new');

  await page.evaluate(() => {
    const b = [...document.querySelectorAll('#p-create .seg button')].find((x) => /template/i.test(x.textContent));
    b && b.click();
  }); await wait(400);
  await shot('04-create-from-template');

  await page.evaluate(() => {
    const t = document.querySelector('#createTemplate .tpl') || document.querySelector('.tpl');
    t && t.click();
  }); await wait(600);

  await page.click('.rail .gate[data-p="clientreview"]'); await wait(600);
  await shot('05-client-review-top');

  // scroll the work column to reach the inclusion summary / reorder list
  await page.evaluate(() => { const w = document.querySelector('.work'); if (w) w.scrollTop = w.scrollHeight; });
  await wait(500);
  await shot('06-client-review-inclusion-list');

  await page.click('.rail .gate[data-p="generate"]'); await wait(400);
  await shot('07-generate-before');

  await page.click('#btnRender2'); await wait(2400);
  await shot('08-generate-after-render');

  // measure a few things worth knowing for the critique
  const metrics = await page.evaluate(() => {
    const w = document.querySelector('.work');
    const rows = document.querySelectorAll('.blk2').length;
    const inputs = document.querySelectorAll('#p-clientreview input, #p-clientreview select').length;
    const req = document.querySelectorAll('[required], [aria-required="true"]').length;
    const labels = document.querySelectorAll('label').length;
    const withFor = [...document.querySelectorAll('label')].filter((l) => l.htmlFor).length;
    const btns = [...document.querySelectorAll('button')].filter((b) => !b.textContent.trim() && !b.getAttribute('aria-label')).length;
    return {
      workColumnScrollHeight: w ? w.scrollHeight : 0,
      workColumnVisibleHeight: w ? w.clientHeight : 0,
      inclusionRows: rows,
      clientReviewFields: inputs,
      fieldsMarkedRequired: req,
      labels, labelsLinkedToInput: withFor,
      buttonsWithNoAccessibleName: btns,
      hasLandmarks: !!document.querySelector('nav') + '/' + !!document.querySelector('main'),
      focusStyleDefined: [...document.styleSheets].length > 0,
    };
  });
  console.log('\nMetrics:\n' + JSON.stringify(metrics, null, 2));
  console.log(notes.length ? '\n' + notes.join('\n') : '\nNo page errors.');
  await browser.close();
})();
