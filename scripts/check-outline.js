// Dev helper: exercise the Review outline panel — tick to include, drag to reorder, and
// confirm both surfaces stay in step and the approval gate re-locks on any change.
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

  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1.3 });
  await page.goto(pathToFileURL(path.resolve('app/SOP_Studio_v0.1.html')).href, { waitUntil: 'networkidle0' });
  await wait(1400);

  await page.click('#btnSeed'); await wait(500);
  await page.click('.rail .gate[data-p="create"]'); await wait(300);
  await page.evaluate(() => document.querySelector('#createTplList .tpl').click()); await wait(600);
  await page.click('.rail .gate[data-p="review"]'); await wait(600);

  const snap = () => page.evaluate(() => ({
    outlineRows: document.querySelectorAll('#outlinePanel .oitem').length,
    outlineTicked: document.querySelectorAll('#outlinePanel .oitem input:checked').length,
    outlineLocked: document.querySelectorAll('#outlinePanel .oitem input:disabled').length,
    detailTicked: document.querySelectorAll('#blockList .blk2 input:checked').length,
    firstStepId: (document.querySelector('#outlinePanel .oitem .oid') || {}).textContent,
    sideBySide: getComputedStyle(document.querySelector('#p-review .review-split')).gridTemplateColumns,
    groupCounts: [...document.querySelectorAll('#outlinePanel .ogroup-h .n')].map((n) => n.textContent),
  }));

  console.log('Outline as rendered:');
  console.log('  ' + JSON.stringify(await snap(), null, 0));

  console.log('\nUntick the first included section in the OUTLINE:');
  await page.evaluate(() => {
    const cb = [...document.querySelectorAll('#outlinePanel .oitem input')].find((c) => c.checked && !c.disabled);
    cb.click();
  });
  await wait(500);
  console.log('  ' + JSON.stringify(await snap(), null, 0));

  console.log('\nGate state after that change:');
  console.log('  ' + JSON.stringify(await page.evaluate(() => ({
    confirmVisible: !!document.getElementById('btnConfirm'),
    renderDisabled: document.getElementById('btnRender2').disabled,
  }))));

  console.log('\nDrag section 2 above section 1 in the outline:');
  const before = await page.evaluate(() => [...document.querySelectorAll('#outlinePanel .oitem .oid')].slice(0, 4).map((n) => n.textContent));
  await page.evaluate(() => {
    const rows = [...document.querySelectorAll('#outlinePanel .oitem[draggable="true"]')];
    const from = rows[1], to = rows[0];
    const dt = new DataTransfer();
    from.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));
    const r = to.getBoundingClientRect();
    to.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer: dt, clientY: r.top + 2 }));
    to.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: dt, clientY: r.top + 2 }));
    from.dispatchEvent(new DragEvent('dragend', { bubbles: true, dataTransfer: dt }));
  });
  await wait(600);
  const after = await page.evaluate(() => [...document.querySelectorAll('#outlinePanel .oitem .oid')].slice(0, 4).map((n) => n.textContent));
  console.log('  before: ' + before.join(' ') + '\n  after : ' + after.join(' ') +
    (before.join() !== after.join() ? '   <- reordered' : '   <- NO CHANGE'));

  const detailOrder = await page.evaluate(() =>
    [...document.querySelectorAll('#blockList .blk2 .t')].slice(0, 4).map((t) => t.textContent.split(' · ')[0]));
  console.log('  detail column order: ' + detailOrder.join(' ') + (detailOrder.join() === after.join() ? '   <- in step' : '   <- OUT OF STEP'));

  await page.screenshot({ path: 'output/review-outline.png' });
  console.log(errs.length ? '\nERRORS:\n  ' + errs.join('\n  ') : '\nNo console errors.');
  await browser.close();
})();
