// Dev helper: reproduce "clicking a gate does nothing" by disabling JavaScript,
// which is what a sandboxed viewer or a stripped snapshot effectively does.
const puppeteer = require('puppeteer');
const path = require('path');
const { pathToFileURL } = require('url');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const url = pathToFileURL(path.resolve('app/SOP_Studio_v0.1.html')).href;

  for (const js of [true, false]) {
    const page = await browser.newPage();
    await page.setJavaScriptEnabled(js);
    await page.setViewport({ width: 1300, height: 780 });
    await page.goto(url, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 900));

    const before = await page.evaluate(() => {
      const p = document.querySelector('.panel.active');
      return p ? p.id : '(none)';
    }).catch(() => '(cannot evaluate)');

    try { await page.click('.rail .gate[data-p="create"]'); } catch (_) {}
    await new Promise((r) => setTimeout(r, 500));

    const state = await page.evaluate(() => {
      const p = document.querySelector('.panel.active');
      const warn = document.getElementById('jswarn');
      return {
        activePanel: p ? p.id : '(none)',
        libStatus: (document.getElementById('libStatus') || {}).textContent || '',
        warningVisible: warn ? getComputedStyle(warn).display !== 'none' : false,
      };
    });

    console.log('JavaScript ' + (js ? 'ENABLED ' : 'BLOCKED ') + ':');
    console.log('  panel before click : ' + before);
    console.log('  panel after click  : ' + state.activePanel + (state.activePanel === 'p-create' ? '  <- navigated' : '  <- did NOT change'));
    console.log('  library line says  : "' + state.libStatus.trim() + '"');
    console.log('  warning banner     : ' + (state.warningVisible ? 'shown' : 'hidden'));
    await page.screenshot({ path: 'output/nojs-' + (js ? 'enabled' : 'blocked') + '.png', clip: { x: 0, y: 0, width: 900, height: 400 } });
    await page.close();
  }
  await browser.close();
})();
