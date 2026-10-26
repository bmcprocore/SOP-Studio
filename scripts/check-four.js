const puppeteer=require('puppeteer');const path=require('path');const {pathToFileURL}=require('url');
const fs=require('fs');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await puppeteer.launch({headless:'new'});const p=await b.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
  await p.setViewport({width:1600,height:1000,deviceScaleFactor:1.25});
  await p.goto(pathToFileURL(path.resolve('app/SOP_Studio_v0.1.html')).href,{waitUntil:'networkidle0'});
  await wait(1400);
  await p.click('#btnSeed');await wait(500);
  await p.click('.rail .gate[data-p="create"]');await wait(300);
  await p.evaluate(()=>document.querySelector('#createTplList .tpl').click());await wait(700);

  console.log('--- 2. detail-level preview ---');
  await p.click('.rail .gate[data-p="permissions"]');await wait(400);
  for(const d of ['simple','standard','extended']){
    await p.click('#detailSeg button[data-v="'+d+'"]');await wait(350);
    const r=await p.evaluate(()=>({pages:document.querySelectorAll('#detailPreview .dpage').length,
      callouts:document.querySelectorAll('#detailPreview .dcall').length,
      images:document.querySelectorAll('#detailPreview .dimg').length,
      pills:document.querySelectorAll('#detailPreview .dpill').length,
      cap:document.querySelector('#detailPreview .dprev-cap').textContent.slice(0,42)}));
    console.log('  '+d.padEnd(9)+JSON.stringify(r));
  }

  console.log('\n--- 1. permission template upload ---');
  const csv='User,Tool,Permission Level,Granular\nJ Smith,RFIs,Admin,Act as RFI Manager\n';
  fs.writeFileSync('output/perm-test.csv',csv);
  const inputHandle=await p.evaluateHandle(()=>{ // wireDrop builds a hidden input on click; emulate the drop path
    return null;});
  await p.evaluate((text)=>{
    const dt=new DataTransfer();
    dt.items.add(new File([text],'perm-export.csv',{type:'text/csv'}));
    const el=document.getElementById('permDrop');
    el.dispatchEvent(new DragEvent('drop',{bubbles:true,dataTransfer:dt}));
  },csv);
  await wait(900);
  console.log('  '+JSON.stringify(await p.evaluate(()=>({
    level:document.querySelector('#permSeg button.on')?.dataset.v,
    granTicked:document.querySelectorAll('#granList input:checked').length,
    file:(document.getElementById('permFileList')||{}).textContent.trim().slice(0,40),
    status:(document.getElementById('permFileStatus')||{}).textContent.trim().slice(0,110)}))));

  console.log('\n--- 3. override an excluded section ---');
  await p.click('#permSeg button[data-v="ReadOnly"]');await wait(450);
  await p.click('.rail .gate[data-p="review"]');await wait(500);
  const before=await p.evaluate(()=>({dropped:document.querySelectorAll('#blockList .blk2.out').length,
    outlineDropped:document.querySelectorAll('#outlinePanel .oitem.out').length,
    detailIsReadOnly:document.querySelectorAll('#blockList input').length===0}));
  console.log('  before: '+JSON.stringify(before));
  await p.evaluate(()=>{ // tick the first dropped row back on, from the outline
    const row=[...document.querySelectorAll('#outlinePanel .oitem.out')][0];
    row.querySelector('input[type=checkbox]').click();});
  await wait(600);
  console.log('  after : '+JSON.stringify(await p.evaluate(()=>({
    overrideChips:document.querySelectorAll('#blockList .ovr').length,
    overrideRows:document.querySelectorAll('#blockList .blk2.overridden').length,
    outlineOverridden:document.querySelectorAll('#outlinePanel .oitem.overridden').length,
    warning:!!document.querySelector('.ovrnote'),
    reConfirmNeeded:!!document.getElementById('btnConfirm')}))));

  await p.evaluate(()=>{const i=document.getElementById('fConfirmBy');i.value='B. McGurk';i.dispatchEvent(new Event('input',{bubbles:true}));});
  await p.evaluate(()=>document.getElementById('btnConfirm').click());await wait(400);
  await p.click('.rail .gate[data-p="generate"]');await wait(300);
  await p.evaluate(()=>document.getElementById('btnRender2').click());await wait(2400);
  console.log('  audit trail: '+JSON.stringify(await p.evaluate(()=>{
    const ta=document.getElementById('sopJson');
    return {rendered:document.getElementById('frame').contentDocument.querySelectorAll('#viewer .page').length};})));

  console.log('\n--- 4. delete a template, gated by retyping its name ---');
  await p.click('.rail .gate[data-p="templates"]');await wait(400);
  await p.evaluate(()=>document.getElementById('btnDeleteTpl').click());await wait(300);
  console.log('  prompt shown: '+await p.evaluate(()=>getComputedStyle(document.getElementById('delRow')).display!=='none'));
  await p.evaluate(()=>{document.getElementById('fDelPw').value='not the template name';});
  await p.evaluate(()=>document.getElementById('btnDelConfirm').click());await wait(400);
  console.log('  wrong name -> '+JSON.stringify(await p.evaluate(()=>({
    templates:document.querySelectorAll('#tplList .tpl').length,
    msg:document.getElementById('delStatus').textContent.trim()}))));
  await p.evaluate(()=>{document.getElementById('fDelPw').value=document.getElementById('delName').textContent;});
  await p.evaluate(()=>document.getElementById('btnDelConfirm').click());await wait(600);
  console.log('  right name -> '+JSON.stringify(await p.evaluate(()=>({
    templates:document.querySelectorAll('#tplList .tpl').length,
    lib:document.getElementById('libStatus').textContent.trim().slice(0,70)}))));

  await p.screenshot({path:'output/four-changes.png'});
  console.log(errs.length?'\nERRORS:\n  '+errs.join('\n  '):'\nNo console errors.');
  await b.close();
})();
