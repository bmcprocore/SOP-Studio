const puppeteer=require('puppeteer');const path=require('path');const {pathToFileURL}=require('url');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await puppeteer.launch({headless:'new'});const p=await b.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
  await p.setViewport({width:1600,height:1000});
  const url=pathToFileURL(path.resolve('app/SOP_Studio_v0.1.html')).href;
  const load=async()=>{await p.goto(url,{waitUntil:'networkidle0'});await wait(1300);
    await p.click('#btnSeed');await wait(400);
    await p.click('.rail .gate[data-p="create"]');await wait(250);
    await p.evaluate(()=>document.querySelector('#createTplList .tpl').click());await wait(600);
    await p.click('.rail .gate[data-p="review"]');await wait(500);};
  await load();

  console.log('B1 keyboard reorder');
  const ids=()=>p.evaluate(()=>[...document.querySelectorAll('#blockList .blk2 .t')].slice(0,3).map(t=>t.textContent.split(' · ')[0]));
  const before=await ids();
  await p.evaluate(()=>{const btns=[...document.querySelectorAll('#outlinePanel [data-move][data-dir="1"]')].filter(b=>!b.disabled);btns[0].click();});
  await wait(500);
  const after=await ids();
  console.log('   before '+before.join(' ')+'  ->  after '+after.join(' ')+(before.join()!==after.join()?'   moved':'   NO CHANGE'));
  console.log('   reachable by keyboard: '+await p.evaluate(()=>{
    const b=[...document.querySelectorAll('#outlinePanel [data-move]')].find(x=>!x.disabled);
    b.focus();return document.activeElement===b;}));

  console.log('\nH1/H4/H5/M2 structure');
  console.log('   '+JSON.stringify(await p.evaluate(()=>({
    unnamedInputs:[...document.querySelectorAll('input')].filter(e=>e.offsetParent&&!e.getAttribute('aria-label')&&!e.getAttribute('title')&&!(e.id&&document.querySelector('label[for="'+e.id+'"]'))).length,
    h1:document.querySelectorAll('h1').length,
    headingOrder:[...document.querySelectorAll('.panel.active h1,.panel.active h2,.panel.active h3')].map(h=>h.tagName),
    ariaRequired:document.querySelectorAll('[aria-required="true"]').length,
    reqMarkers:document.querySelectorAll('.req').length,
    rowLabels:document.querySelectorAll('#outlinePanel label.otitle').length,
    checkboxPx:(()=>{const c=document.querySelector('#outlinePanel input');const r=c.getBoundingClientRect();return Math.round(r.width)+'x'+Math.round(r.height);})(),
    ordMin:(()=>{const o=document.querySelector('.ord');const r=o.getBoundingClientRect();return Math.round(r.width)+'x'+Math.round(r.height);})(),
  }))));

  console.log('\nH2 live regions');
  console.log('   '+JSON.stringify(await p.evaluate(()=>({
    liveRegions:document.querySelectorAll('[aria-live]').length,
    roles:[...document.querySelectorAll('[aria-live]')].map(e=>e.id+':'+e.getAttribute('role')).slice(0,7)}))));

  console.log('\nM3 autosave / restore');
  await p.click('.rail .gate[data-p="details"]');await wait(250);
  await p.evaluate(()=>{const e=document.getElementById('fCustomer');e.value='Kingsmede Constructions';e.dispatchEvent(new Event('input',{bubbles:true}));});
  await wait(1400);
  const stored=await p.evaluate(()=>{const d=localStorage.getItem('sop-draft');return d?{bytes:d.length,customer:JSON.parse(d).fields.fCustomer}:null;});
  console.log('   draft written: '+JSON.stringify(stored));
  await p.goto(url,{waitUntil:'networkidle0'});await wait(1400);
  console.log('   restore banner on reload: '+await p.evaluate(()=>getComputedStyle(document.getElementById('restoreBar')).display!=='none'));
  await p.evaluate(()=>document.getElementById('btnRestore').click());await wait(900);
  console.log('   after restore: '+JSON.stringify(await p.evaluate(()=>({
    customer:document.getElementById('fCustomer').value,
    panel:(document.querySelector('.panel.active')||{}).id,
    rows:document.querySelectorAll('#blockList .blk2').length}))));

  console.log('\nL1/L2/L3 polish');
  console.log('   '+JSON.stringify(await p.evaluate(()=>({
    lang:document.documentElement.lang,
    delLabel:(document.querySelector('label[for="fDelPw"]')||{}).textContent,
    headerDownloadPrimary:document.getElementById('btnDownload').classList.contains('primary')}))));
  await p.click('.rail .gate[data-p="create"]');await wait(200);
  await p.select('#fRegion','NAMER');await wait(300);
  console.log('   lang after choosing NAMER: '+await p.evaluate(()=>document.documentElement.lang));

  console.log(errs.length?'\nERRORS:\n  '+errs.join('\n  '):'\nNo console errors.');
  await b.close();
})();
