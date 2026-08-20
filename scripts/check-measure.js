// Dev helper: prove the renderer can still measure page heights while the preview pane
// is parked off-screen (the "no-preview" layout). If these come back zero, pagination breaks.
const puppeteer = require('puppeteer');
const path = require('path');
const { pathToFileURL } = require('url');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.setViewport({ width: 1400, height: 800 });
  await page.goto(pathToFileURL(path.resolve('app/SOP_Studio_v0.1.html')).href, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1500));

  const measure = () =>
    page.evaluate(() => {
      const f = document.getElementById('frame');
      const d = f && f.contentDocument;
      const mb = d && d.getElementById('sop-measure-body');
      const pg = d && d.querySelector('.page');
      return {
        offscreen: document.body.classList.contains('no-preview'),
        iframeWidth: f ? f.getBoundingClientRect().width : 0,
        measureBodyFound: !!mb,
        measureBodyHeight: mb ? Math.round(mb.getBoundingClientRect().height) : 0,
        measureBodyWidth: mb ? Math.round(mb.getBoundingClientRect().width) : 0,
        pageHeight: pg ? Math.round(pg.getBoundingClientRect().height) : 0,
      };
    });

  console.log('WITH preview parked off-screen:');
  console.log(' ', JSON.stringify(await measure(), null, 0));

  await page.evaluate(() => document.body.classList.remove('no-preview'));
  await new Promise((r) => setTimeout(r, 400));
  console.log('WITH preview on-screen (after a render):');
  console.log(' ', JSON.stringify(await measure(), null, 0));

  console.log(errors.length ? '\nConsole errors:\n  ' + errors.join('\n  ') : '\nNo console errors.');
  await browser.close();
})();
