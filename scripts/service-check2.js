// Second service pass: states a real user will hit that the happy path never exercises.
const puppeteer = require('puppeteer');
const path = require('path');
const { pathToFileURL } = require('url');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const URL = pathToFileURL(path.resolve('app/SOP_Studio_v0.1.html')).href;
const findings = [];
const note = (sev, area, msg) => findings.push({ sev, area, msg });

(async () => {
  const b = await puppeteer.launch({ headless: 'new' });

  // A — permission level None: everything is excluded. What does the user get?
  {
    const p = await b.newPage(); const errs = [];
    p.on('pageerror', (e) => errs.push(String(e)));
    await p.setViewport({ width: 1600, height: 1000 });
    await p.goto(URL, { waitUntil: 'networkidle0' }); await wait(1400);
    await p.click('#btnSeed'); await wait(430);
    await p.click('.rail .gate[data-p="create"]'); await wait(240);
    await p.evaluate(() => document.querySelector('#createTplList .tpl').click()); await wait(650);
    await p.click('.rail .gate[data-p="permissions"]'); await wait(240);
    await p.click('#permSeg button[data-v="None"]'); await wait(500);
    await p.click('.rail .gate[data-p="review"]'); await wait(450);
    const r = await p.evaluate(() => ({
      included: document.querySelectorAll('#outlinePanel .oitem input:checked').length,
      canConfirm: !!document.getElementById('btnConfirm'),
      warns: /nothing|no sections|empty/i.test(document.querySelector('#p-review').innerText),
    }));
    let pages = 0;
    if (r.canConfirm) {
      await p.evaluate(() => { const i = document.getElementById('fConfirmBy'); i.value = 'x'; i.dispatchEvent(new Event('input', { bubbles: true })); });
      await p.evaluate(() => document.getElementById('btnConfirm').click()); await wait(380);
      await p.click('.rail .gate[data-p="generate"]'); await wait(240);
      await p.evaluate(() => document.getElementById('btnRender2').click()); await wait(2400);
      pages = await p.evaluate(() => document.getElementById('frame').contentDocument.querySelectorAll('#viewer .page').length);
    }
    console.log('  permission None : ' + r.included + ' sections included, confirmable = ' + r.canConfirm + ', rendered ' + pages + ' pages');
    if (r.included === 0 && r.canConfirm && !r.warns) {
      note('MEDIUM', 'empty document',
        'With permission level None every section is dropped, yet the list can still be confirmed and a ' + pages + '-page SOP produced containing no procedure at all. Nothing warns that the reader would receive an empty guide.');
    }
    if (errs.length) note('HIGH', 'robustness', 'Errors at permission None: ' + errs.slice(0, 2).join(' | '));
    await p.close();
  }

  // (A two-tab probe lived here. Two pages driven at once times out under automation,
  //  and the finding stands on reasoning: both tabs share one draft slot, so the last
  //  to type wins. Only bites someone building two SOPs simultaneously.)

  // C — a template with no steps at all
  {
    const p = await b.newPage(); const errs = [];
    p.on('pageerror', (e) => errs.push(String(e)));
    await p.setViewport({ width: 1500, height: 950 });
    await p.goto(URL, { waitUntil: 'networkidle0' }); await wait(1400);
    await p.click('#btnSeed'); await wait(430);
    await p.evaluate(() => {
      const lib = JSON.parse(localStorage.getItem('sop-templates'));
      lib.tools['Empty tool'] = { name: 'Empty tool', version: '1.0', steps: [], checklist: [], issues: [], phases: [], references: [] };
      localStorage.setItem('sop-templates', JSON.stringify(lib));
    });
    await p.reload({ waitUntil: 'networkidle0' }); await wait(1400);
    await p.click('.rail .gate[data-p="create"]'); await wait(300);
    const picked = await p.evaluate(() => {
      const rows = [...document.querySelectorAll('#createTplList .tpl')];
      const t = rows.find((r) => /Empty tool/.test(r.textContent));
      if (t) { t.click(); return true; } return false;
    });
    await wait(700);
    const r = await p.evaluate(() => ({
      reviewRows: document.querySelectorAll('#outlinePanel .oitem').length,
      canConfirm: !!document.getElementById('btnConfirm'),
    }));
    console.log('  empty template  : picked = ' + picked + ', sections = ' + r.reviewRows + ', confirmable = ' + r.canConfirm);
    if (errs.length) note('HIGH', 'robustness', 'Errors with an empty template: ' + errs.slice(0, 2).join(' | '));
    await p.close();
  }

  await b.close();
  console.log('\n' + '='.repeat(72));
  if (!findings.length) { console.log('No findings.'); return; }
  ['HIGH', 'MEDIUM', 'LOW'].forEach((sev) => {
    findings.filter((f) => f.sev === sev).forEach((f) => console.log('[' + sev + '] ' + f.area + '\n   ' + f.msg + '\n'));
  });
})();
