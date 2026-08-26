// Service check: drive the app hard and report anything that breaks, could break, or wastes
// the user's time. Read-only — it changes nothing.
const puppeteer = require('puppeteer');
const path = require('path');
const { pathToFileURL } = require('url');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const URL = pathToFileURL(path.resolve('app/SOP_Studio_v0.1.html')).href;
const findings = [];
const note = (sev, area, msg) => findings.push({ sev, area, msg });

const seedAndLoad = async (p) => {
  await p.click('#btnSeed'); await wait(450);
  await p.click('.rail .gate[data-p="create"]'); await wait(250);
  await p.evaluate(() => document.querySelector('#createTplList .tpl').click()); await wait(650);
};
const confirmAndRender = async (p) => {
  await p.click('.rail .gate[data-p="review"]'); await wait(400);
  if (await p.evaluate(() => !!document.getElementById('btnConfirm'))) {
    await p.evaluate(() => { const i = document.getElementById('fConfirmBy'); i.value = 'check'; i.dispatchEvent(new Event('input', { bubbles: true })); });
    await p.evaluate(() => document.getElementById('btnConfirm').click()); await wait(380);
  }
  await p.click('.rail .gate[data-p="generate"]'); await wait(240);
  await p.evaluate(() => document.getElementById('btnRender2').click()); await wait(2500);
};

(async () => {
  const b = await puppeteer.launch({ headless: 'new' });

  // 1 — first run: how much work before a document exists?
  {
    const p = await b.newPage(); const errs = [];
    p.on('pageerror', (e) => errs.push('pageerror: ' + e));
    p.on('console', (m) => m.type() === 'error' && errs.push('console: ' + m.text()));
    await p.setViewport({ width: 1600, height: 1000 });
    await p.goto(URL, { waitUntil: 'networkidle0' }); await wait(1500);
    const first = await p.evaluate(() => ({
      empty: document.querySelectorAll('#tplList .tpl').length === 0,
      status: document.getElementById('libStatus').textContent.trim(),
    }));
    if (first.empty) {
      note('MEDIUM', 'first run',
        'The source app opens with an empty library and asks the user to "seed the RFI master template" — jargon, and a step the published build removes. Anyone handed app/ rather than dist/ meets it.');
    }
    let actions = 0;
    await p.click('#btnSeed'); actions++; await wait(450);
    await p.click('.rail .gate[data-p="create"]'); actions++; await wait(250);
    await p.evaluate(() => document.querySelector('#createTplList .tpl').click()); actions++; await wait(650);
    await p.click('.rail .gate[data-p="review"]'); actions++; await wait(400);
    await p.evaluate(() => { const i = document.getElementById('fConfirmBy'); i.value = 'x'; i.dispatchEvent(new Event('input', { bubbles: true })); }); actions++;
    await p.evaluate(() => document.getElementById('btnConfirm').click()); actions++; await wait(400);
    await p.click('.rail .gate[data-p="generate"]'); actions++; await wait(250);
    await p.evaluate(() => document.getElementById('btnRender2').click()); actions++; await wait(2500);
    const done = await p.evaluate(() => ({
      pages: document.getElementById('frame').contentDocument.querySelectorAll('#viewer .page').length,
      downloadReady: !document.getElementById('btnDownload').disabled,
    }));
    console.log('  first run       : ' + actions + ' actions to a rendered ' + done.pages + '-page SOP');
    if (!done.downloadReady) note('HIGH', 'first run', 'Download is still disabled after a successful render.');
    if (errs.length) note('HIGH', 'console', 'Errors on the normal path: ' + errs.join(' | '));
    await p.close();
  }

  // 2 — do all three detail levels actually differ?
  {
    const p = await b.newPage(); await p.setViewport({ width: 1600, height: 1000 });
    await p.goto(URL, { waitUntil: 'networkidle0' }); await wait(1400);
    await seedAndLoad(p);
    const out = {};
    for (const d of ['simple', 'standard', 'extended']) {
      await p.click('.rail .gate[data-p="permissions"]'); await wait(220);
      await p.click('#detailSeg button[data-v="' + d + '"]'); await wait(350);
      await confirmAndRender(p);
      out[d] = await p.evaluate(() => {
        const dd = document.getElementById('frame').contentDocument;
        return { pages: dd.querySelectorAll('#viewer .page').length,
                 chars: dd.getElementById('viewer').innerText.replace(/\s+/g, ' ').length };
      });
    }
    console.log('  detail levels   : ' + Object.entries(out).map(([k, v]) => k + ' ' + v.pages + 'pp/' + v.chars + 'ch').join('  '));
    if (out.standard.chars === out.extended.chars) {
      note('MEDIUM', 'detail levels',
        'Standard and Extended produce identical documents (' + out.extended.chars + ' characters). Extended promises expanded bullets and common-mistake callouts, but the RFI template carries no extra content for it, so the choice does nothing.');
    }
    await p.close();
  }

  // 3 — hostile / awkward input in client fields
  {
    const p = await b.newPage(); const errs = [];
    p.on('pageerror', (e) => errs.push(String(e)));
    await p.setViewport({ width: 1600, height: 1000 });
    await p.goto(URL, { waitUntil: 'networkidle0' }); await wait(1400);
    await seedAndLoad(p);
    await p.click('.rail .gate[data-p="details"]'); await wait(240);
    const nasty = '<img src=x onerror="window.__XSS=1"> & "quotes" ' + 'A'.repeat(300);
    await p.evaluate((v) => {
      ['fCustomer', 'fDocId', 'fOwner', 'fAppliesTo'].forEach((id) => {
        const e = document.getElementById(id);
        if (e) { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }
      });
    }, nasty);
    await wait(400);
    await confirmAndRender(p);
    const r = await p.evaluate(() => ({
      xssTop: !!window.__XSS,
      xssFrame: !!document.getElementById('frame').contentWindow.__XSS,
      pages: document.getElementById('frame').contentDocument.querySelectorAll('#viewer .page').length,
    }));
    console.log('  hostile input   : ' + r.pages + ' pages rendered, script executed = ' + (r.xssTop || r.xssFrame));
    if (r.xssTop || r.xssFrame) {
      note('HIGH', 'security', 'Text typed into a client field executed as script inside the document. Client names come from customers and land in a file that gets emailed.');
    }
    if (errs.length) note('MEDIUM', 'robustness', 'Page errors with awkward input: ' + errs.slice(0, 2).join(' | '));
    await p.close();
  }

  // 4 — browser storage unavailable (private window, locked-down profile)
  {
    const p = await b.newPage(); const errs = [];
    p.on('pageerror', (e) => errs.push(String(e)));
    await p.setViewport({ width: 1400, height: 900 });
    await p.evaluateOnNewDocument(() => {
      Object.defineProperty(window, 'localStorage', { get() { throw new Error('storage blocked'); } });
    });
    await p.goto(URL, { waitUntil: 'networkidle0' }); await wait(1600);
    const r = await p.evaluate(() => {
      const g = document.querySelector('.rail .gate[data-p="create"]');
      if (g) g.click();
      return { navWorks: (document.querySelector('.panel.active') || {}).id === 'p-create',
               seedPresent: !!document.getElementById('btnSeed') };
    });
    console.log('  storage blocked : navigation works = ' + r.navWorks);
    if (!r.navWorks) note('HIGH', 'robustness', 'With browser storage blocked the app stops responding. Private windows and locked-down corporate profiles do exactly this.');
    if (errs.length) note('HIGH', 'robustness', 'Uncaught errors when storage is blocked: ' + errs.slice(0, 2).join(' | '));
    await p.close();
  }

  await b.close();
  console.log('\n' + '='.repeat(72));
  if (!findings.length) { console.log('No findings.'); return; }
  ['HIGH', 'MEDIUM', 'LOW'].forEach((sev) => {
    findings.filter((f) => f.sev === sev).forEach((f) => console.log('[' + sev + '] ' + f.area + '\n   ' + f.msg + '\n'));
  });
})();
