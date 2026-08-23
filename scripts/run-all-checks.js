// One place to run every regression script. Reports a crash as a failure, which a keyword
// grep does not — that blind spot let a broken test read as passing.
const { execFileSync } = require('child_process');
const fs = require('fs');
const scripts = fs.readdirSync('scripts')
  .filter(f => /^check-.*\.js$/.test(f) && f !== 'check-nojs.js')
  .sort();
let bad = 0;
for (const f of scripts) {
  let out = '', status = 'pass';
  try { out = execFileSync(process.execPath, ['scripts/' + f], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (e) { out = (e.stdout || '') + (e.stderr || ''); status = 'CRASHED'; }
  if (status === 'pass' && /ERRORS|FAIL |NO CHANGE|OUT OF STEP|did NOT change/.test(out)) status = 'FAILED';
  if (status !== 'pass') { bad++; }
  console.log('  ' + status.padEnd(9) + f);
  if (status !== 'pass') console.log(out.split('\n').filter(l => /ERROR|FAIL|Error|NO CHANGE/.test(l)).slice(0, 3).map(l => '        ' + l.trim()).join('\n'));
}
console.log(bad ? '\n' + bad + ' script(s) not passing' : '\nAll ' + scripts.length + ' scripts pass');
process.exit(bad ? 1 : 0);
