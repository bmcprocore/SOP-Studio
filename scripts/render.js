#!/usr/bin/env node
/**
 * render.js — render a content JSON into the final standalone SOP HTML (and optional PDF)
 * using the LOCKED design in design/SOP_Builder_step_per_page_v2.html.
 *
 * Usage:
 *   npm install puppeteer            (once)
 *   node scripts/render.js output/Client_RFIs_PM_v1.0.json [--pdf]
 *
 * Output: same path with .html (and .pdf) extension.
 * The builder page itself does the pagination/measurement, so output is identical to
 * rendering in the browser app.
 */
const fs = require('fs');
const path = require('path');

// Design v3: the locked design is authored at US Letter; APAC prints on A4. The page tokens are
// overridden for A4 rather than the base design being rewritten. 210x297mm at 96dpi = 794x1123px.
function pageSizeCss(region) {
  return ':root{--page-w:794px;--page-h:1123px;}' +
    '@page{size:A4 portrait;margin:0;}' +
    '@media print{.page{width:210mm;height:297mm;}}';
}

async function main() {
  const jsonPath = process.argv[2];
  const wantPdf = process.argv.includes('--pdf');
  if (!jsonPath) { console.error('Usage: node scripts/render.js <content.json> [--pdf]'); process.exit(1); }

  const content = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const builderPath = path.resolve(__dirname, '..', 'design', 'SOP_Builder_step_per_page_v2.html');
  if (!fs.existsSync(builderPath)) { console.error('Locked builder not found at ' + builderPath); process.exit(1); }

  let puppeteer;
  try { puppeteer = require('puppeteer'); }
  catch { console.error('puppeteer not installed — run: npm install puppeteer'); process.exit(1); }

  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    const page = await browser.newPage();
    await page.goto('file://' + builderPath, { waitUntil: 'networkidle0' });

    // set the paper before anything is measured, in the page and in its sandbox iframe
    const region = content._region || 'TBC';
    const extraCss = pageSizeCss(region);
    if (extraCss) {
      await page.evaluate((css) => {
        const add = (doc) => { const st = doc.createElement('style'); st.id = 'pagesize'; st.textContent = css; doc.head.appendChild(st); };
        add(document);
        const f = document.getElementById('frame');
        if (f && f.contentDocument) add(f.contentDocument);
      }, extraCss);
    }

    // Wait for the sandbox iframe + fonts, then build the document via the builder's own renderer.
    const html = await page.evaluate(async (c) => {
      const frame = document.getElementById('frame');
      // wait for iframe measure body + fonts
      await new Promise((res) => {
        const tick = () => {
          const d = frame.contentDocument;
          if (d && d.getElementById('sop-measure-body')) {
            if (d.fonts && d.fonts.ready) d.fonts.ready.then(res); else res();
          } else setTimeout(tick, 100);
        };
        tick();
      });
      return window.SOPRender.document(c, frame.contentDocument);
    }, content);

    const outHtml = jsonPath.replace(/\.json$/i, '') + '.html';
    // the standalone file must carry the same override, or it reverts to Letter when opened
    const finalHtml = extraCss
      ? html.replace('</style>', extraCss + '</style>')
      : html;
    fs.writeFileSync(outHtml, finalHtml);
    console.log('Wrote ' + outHtml + '  (' + 'A4' + ')');

    if (wantPdf) {
      const doc = await browser.newPage();
      await doc.setContent(finalHtml, { waitUntil: 'networkidle0' });
      await doc.evaluateHandle('document.fonts.ready');
      const outPdf = jsonPath.replace(/\.json$/i, '') + '.pdf';
      await doc.pdf({ path: outPdf, format: 'a4', printBackground: true, margin: { top: 0, bottom: 0, left: 0, right: 0 } });
      console.log('Wrote ' + outPdf);
    }
  } finally {
    await browser.close();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
