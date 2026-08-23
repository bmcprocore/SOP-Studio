const puppeteer=require('puppeteer');const path=require('path');const {pathToFileURL}=require('url');
const fs=require('fs');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await puppeteer.launch({headless:'new'});const p=await b.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
  await p.setViewport({width:1500,height:900});
  if(!fs.existsSync('dist')||!fs.readdirSync('dist').some(f=>f.endsWith('.html'))){
    console.log('  skipped — no published build yet. Run: node scripts/publish-build.js');
    await b.close(); return; }
  const dist=fs.readdirSync('dist').filter(f=>f.endsWith('.html')).sort().pop();
  const url=pathToFileURL(path.resolve('dist',dist)).href;
  console.log('build under test: '+dist);

  // 1. a brand new person opens it — templates must be there with no action
  await p.goto(url,{waitUntil:'networkidle0'});await wait(1500);
  console.log('  fresh open  : '+JSON.stringify(await p.evaluate(()=>({
    templates:[...document.querySelectorAll('#tplList .tpl .nm')].map(n=>n.textContent.trim()),
    published:document.querySelectorAll('#tplList .pubtag').length,
    status:document.getElementById('libStatus').textContent.trim()}))));

  // 2. they save a template of their own
  await p.evaluate(()=>{
    const lib=JSON.parse(localStorage.getItem('sop-templates'));
    lib.tools['My own draft']={name:'My own draft',version:'0.1',steps:[{_id:'S1',title:'mine'}],checklist:[],issues:[]};
    localStorage.setItem('sop-templates',JSON.stringify(lib));});
  await p.reload({waitUntil:'networkidle0'});await wait(1400);
  console.log('  after saving own: '+JSON.stringify(await p.evaluate(()=>
    [...document.querySelectorAll('#tplList .tpl .nm')].map(n=>n.textContent.replace(/\s+/g,' ').trim()))));

  // 3. a NEWER build arrives — published templates refresh, their own survives
  const html=fs.readFileSync(path.resolve('dist',dist),'utf8');
  const bumped=html.replace(/"version":\d+,"publishedAt"/, '"version":99,"publishedAt"');
  fs.writeFileSync('dist/_newer.html',bumped);
  await p.goto(pathToFileURL(path.resolve('dist','_newer.html')).href,{waitUntil:'networkidle0'});await wait(1500);
  console.log('  newer build : '+JSON.stringify(await p.evaluate(()=>({
    templates:[...document.querySelectorAll('#tplList .tpl .nm')].map(n=>n.textContent.replace(/\s+/g,' ').trim()),
    status:document.getElementById('libStatus').textContent.trim()}))));

  // 4. opening the SAME build again must not re-announce
  await p.reload({waitUntil:'networkidle0'});await wait(1400);
  console.log('  same again  : '+JSON.stringify(await p.evaluate(()=>document.getElementById('libStatus').textContent.trim())));

  // 5. the source app (no published library) still behaves as before
  await p.goto(pathToFileURL(path.resolve('app/SOP_Studio_v0.1.html')).href,{waitUntil:'networkidle0'});await wait(1400);
  console.log('  source app  : '+JSON.stringify(await p.evaluate(()=>({
    hasPublished:typeof PUBLISHED_LIBRARY!=='undefined'&&PUBLISHED_LIBRARY!==null,
    status:document.getElementById('libStatus').textContent.trim().slice(0,60)}))).slice(0,140));

  fs.unlinkSync('dist/_newer.html');
  console.log(errs.length?'\nERRORS:\n  '+errs.join('\n  '):'\nNo console errors.');
  await b.close();
})();
