// Dev helper: prove the region dropdown swaps terminology in the finished document,
// preserves capitalisation, leaves inline markup alone, and changes nothing when unset.
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

  await page.setViewport({ width: 1500, height: 950 });
  await page.goto(pathToFileURL(path.resolve('app/SOP_Studio_v0.1.html')).href, { waitUntil: 'networkidle0' });
  await wait(1400);

  console.log('Dropdown options: ' + JSON.stringify(await page.evaluate(() =>
    [...document.querySelectorAll('#fRegion option')].map((o) => o.value))));
  console.log('Default selected : ' + await page.evaluate(() => document.getElementById('fRegion').value));

  await page.click('#btnSeed'); await wait(500);
  await page.click('.rail .gate[data-p="create"]'); await wait(300);
  await page.evaluate(() => document.querySelector('#createTplList .tpl').click()); await wait(600);

  // Inject the term in three capitalisations plus one inside inline markup.
  await page.click('.rail .gate[data-p="review"]'); await wait(400);
  await page.evaluate(() => document.getElementById('btnShowJson').click()); await wait(300);
  await page.evaluate(() => {
    const ta = document.getElementById('sopJson');
    const j = JSON.parse(ta.value);
    j.purpose = 'The Head contract governs this. A head contract variation follows. HEAD CONTRACT rules apply.';
    j.steps[0].body = 'Open the <code>head contract</code> record and check the Head contract dates.';
    ta.value = JSON.stringify(j, null, 2);
    ta.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await wait(600);

  const renderWith = async (region) => {
    await page.click('.rail .gate[data-p="create"]'); await wait(250);
    await page.select('#fRegion', region); await wait(400);
    await page.click('.rail .gate[data-p="review"]'); await wait(350);
    const needsConfirm = await page.evaluate(() => !!document.getElementById('btnConfirm'));
    if (needsConfirm) {
      await page.evaluate(() => { const i = document.getElementById('fConfirmBy'); i.value = 'Automated check'; i.dispatchEvent(new Event('input', { bubbles: true })); });
      await page.evaluate(() => document.getElementById('btnConfirm').click());
      await wait(350);
    }
    await page.click('.rail .gate[data-p="generate"]'); await wait(250);
    await page.evaluate(() => document.getElementById('btnRender2').click());
    await wait(2200);
    return page.evaluate(() => {
      const d = document.getElementById('frame').contentDocument;
      const txt = d ? d.getElementById('viewer').innerText : '';
      const html = d ? d.getElementById('viewer').innerHTML : '';
      return {
        head: (txt.match(/head contract/gi) || []).length,
        prime: (txt.match(/prime contract/gi) || []).length,
        keepsCaps: /HEAD CONTRACT|PRIME CONTRACT/.test(txt) ? (txt.match(/PRIME CONTRACT/) ? 'PRIME CONTRACT' : 'HEAD CONTRACT') : '(none)',
        sentenceCase: (txt.match(/(Head|Prime) contract governs/) || ['-'])[0],
        markupIntact: /<code>[^<]*contract<\/code>/i.test(html),
      };
    });
  };

  for (const r of ['TBC', 'APAC', 'NAMER']) {
    const res = await renderWith(r);
    console.log('\nRegion ' + r.padEnd(5) + ' -> ' + JSON.stringify(res));
  }

  console.log(errs.length ? '\nERRORS:\n  ' + errs.join('\n  ') : '\nNo console errors.');
  await browser.close();
})();
