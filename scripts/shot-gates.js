// Dev helper: click each gate in the rail and capture which panel it opens.
const puppeteer = require('puppeteer');
const path = require('path');
const { pathToFileURL } = require('url');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.setViewport({ width: 1400, height: 760, deviceScaleFactor: 1.25 });
  await page.goto(pathToFileURL(path.resolve('app/SOP_Studio_v0.1.html')).href, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 900));

  const gates = await page.$$eval('.rail .gate', (gs) => gs.map((g) => g.dataset.p));
  console.log('Gates found:', gates.join(', '));

  for (const g of gates) {
    await page.click('.rail .gate[data-p="' + g + '"]');
    await new Promise((r) => setTimeout(r, 350));
    const state = await page.evaluate(() => {
      const panel = document.querySelector('.panel.active');
      const heading = panel && panel.querySelector('h2');
      return {
        panelId: panel ? panel.id : '(none)',
        heading: heading ? heading.textContent.trim() : '(no heading)',
        visibleText: panel ? panel.innerText.replace(/\s+/g, ' ').trim().length : 0,
        activeGate: (document.querySelector('.rail .gate.active') || {}).dataset?.p || '(none)',
      };
    });
    console.log(
      '  click "' + g + '" -> panel ' + state.panelId +
      ' | heading: "' + state.heading + '"' +
      ' | gate highlighted: ' + state.activeGate +
      ' | ' + state.visibleText + ' chars of content'
    );
    await page.screenshot({ path: 'output/gate-' + g + '.png', clip: { x: 0, y: 0, width: 800, height: 700 } });
  }

  console.log(errors.length ? '\nConsole errors:\n  ' + errors.join('\n  ') : '\nNo console errors.');
  await browser.close();
})();
