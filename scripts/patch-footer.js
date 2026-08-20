/**
 * One-off patch: add the author attribution line to the SOP document footer, in both
 * renderers, so they stay byte-identical in behaviour.
 *
 * This versions the locked document design v2 -> v3, which CLAUDE.md permits only on an
 * explicit human instruction. That instruction was given.
 */
const fs = require('fs');

const TARGETS = ['design/SOP_Builder_step_per_page_v2.html', 'app/SOP_Studio_v0.1.html'];

const ATTRIBUTION_CONST =
  "  // v3 — author attribution printed on every page. Single source: change it here.\n" +
  "  const SOP_ATTRIBUTION = 'Created by Brendan McGurk \\u00b7 APAC Strategic Product Consultant' +\n" +
  "    ' \\u00b7 Questions or support: message me on Slack, or post in the SOP Studio channel';\n";

const NEW_FOOTER =
  `'<footer class="pg-footer">' +
      '<div class="footer-row">' +
      '<span class="footer-mark"><span class="hex"></span> Procore \\u00b7 Confidential to ' + phi(c.customer, 'Customer') + '</span>' +
      '<span class="confidential">Revision ' + esc(c.version || '1.0') + ' \\u00b7 ' +
      (c.effectiveFrom && c.effectiveFrom.trim() ? esc(c.effectiveFrom) : '[DD Mmm YYYY]') + '</span>' +
      '<span class="pageno">' + String(nn).padStart(2, '0') + '<span class="total"> / ' + String(total).padStart(2, '0') + '</span></span>' +
      '</div>' +
      '<div class="footer-by">' + SOP_ATTRIBUTION + '</div></footer>';`;

let ok = true;
for (const f of TARGETS) {
  let s = fs.readFileSync(f, 'utf8');
  const before = s;

  // 1. Taller footer to fit the second line.
  const hits = (s.match(/--footer-h:36px/g) || []).length;
  s = s.replace(/--footer-h:36px/g, '--footer-h:54px');

  // 2. Footer becomes two stacked rows instead of one.
  s = s.replace(
    /\.pg-footer\{[^}]*\}/,
    '.pg-footer{position:absolute;left:0;right:0;bottom:0;height:var(--footer-h);padding:6px var(--page-pad-x) 7px;' +
      'border-top:1px solid var(--rule);display:flex;flex-direction:column;justify-content:center;gap:3px;' +
      'font-size:9pt;color:var(--fg-muted);}' +
      '\\n  .pg-footer .footer-row{display:flex;align-items:center;justify-content:space-between;gap:16px;}' +
      '\\n  .pg-footer .footer-by{font-size:7.5pt;line-height:1.3;color:var(--procore-gray-400);}'
  );

  // 3. Attribution constant, declared just before the footer builder.
  if (!s.includes('SOP_ATTRIBUTION')) {
    s = s.replace(/(\n\s*function footer\(c, nn, total\) \{)/, '\n' + ATTRIBUTION_CONST + '$1');
  }

  // 4. The footer markup itself.
  s = s.replace(/'<footer class="pg-footer">' \+[\s\S]*?<\/span><\/span><\/footer>';/, NEW_FOOTER);

  fs.writeFileSync(f, s);
  const applied = {
    footerHeight: hits,
    twoRowCss: /footer-by\{font-size/.test(s),
    constant: s.includes('const SOP_ATTRIBUTION'),
    markup: s.includes('<div class="footer-by">'),
    changed: s !== before,
  };
  console.log(f);
  console.log('  ' + JSON.stringify(applied));
  if (!applied.twoRowCss || !applied.constant || !applied.markup) ok = false;
}
console.log(ok ? '\nAll patches applied.' : '\nSOMETHING DID NOT APPLY — check above.');
process.exit(ok ? 0 : 1);
