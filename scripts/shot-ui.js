// Dev helper: screenshot the Studio interface so UI changes can be checked visually.
const puppeteer = require('puppeteer');
const path = require('path');
const { pathToFileURL } = require('url');

(async () => {
  const target = process.argv[2] || 'app/SOP_Studio_v0.1.html';
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.setViewport({ width: 1400, height: 820, deviceScaleFactor: 1.5 });
  await page.goto(pathToFileURL(path.resolve(target)).href, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1200));

  await page.screenshot({ path: 'output/ui-full.png' });
  await page.screenshot({ path: 'output/ui-detail.png', clip: { x: 0, y: 0, width: 620, height: 460 } });

  console.log('Wrote output/ui-full.png and output/ui-detail.png');
  console.log(errors.length ? 'Console errors:\n  ' + errors.join('\n  ') : 'No console errors.');
  await browser.close();
})();
