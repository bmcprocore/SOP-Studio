const puppeteer=require('puppeteer');const path=require('path');const {pathToFileURL}=require('url');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await puppeteer.launch({headless:'new'});const p=await b.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
  await p.setViewport({width:1600,height:900,deviceScaleFactor:1.25});
  await p.goto(pathToFileURL(path.resolve('app/SOP_Studio_v0.1.html')).href,{waitUntil:'networkidle0'});
  await wait(1400);
  await p.click('#btnSeed');await wait(450);
  await p.click('.rail .gate[data-p="create"]');await wait(300);
  await p.evaluate(()=>document.querySelector('#createTplList .tpl').click());await wait(650);
  await p.click('.rail .gate[data-p="review"]');await wait(550);

  const measure=()=>p.evaluate(()=>{
    const w=document.querySelector('.work');
    const cb=document.getElementById('confirmBox');
    const r=cb?cb.getBoundingClientRect():null;
    return {visibleRows:document.querySelectorAll('#blockList .rev-rows:not([hidden]) .blk2').length,
      openGroups:document.querySelectorAll('#blockList .rev-group:not(.closed)').length,
      listHeight:Math.round(document.getElementById('blockList').getBoundingClientRect().height),
      signOffOnScreen: r ? (r.top < window.innerHeight && r.bottom > 0) : false,
      toggleLabel:(document.getElementById('btnCollapseAll')||{}).textContent};
  });
  console.log('expanded : '+JSON.stringify(await measure()));

  await p.evaluate(()=>document.getElementById('btnCollapseAll').click());await wait(450);
  console.log('collapsed: '+JSON.stringify(await measure()));

  await p.evaluate(()=>document.querySelector('#blockList .rev-toggle[data-toggle="check"]').click());await wait(400);
  console.log('one group reopened: '+JSON.stringify(await p.evaluate(()=>({
    openGroups:document.querySelectorAll('#blockList .rev-group:not(.closed)').length,
    which:[...document.querySelectorAll('#blockList .rev-group:not(.closed)')].map(g=>g.dataset.g)}))));

  console.log('\n--- customer segment ---');
  await p.evaluate(()=>{const i=document.getElementById('fConfirmBy');i.value='B. McGurk';i.dispatchEvent(new Event('input',{bubbles:true}));});
  await p.evaluate(()=>document.getElementById('btnConfirm').click());await wait(400);
  await p.click('.rail .gate[data-p="details"]');await wait(250);
  await p.evaluate(()=>{const e=document.getElementById('fCustomer');e.value='Kingsmede Constructions';e.dispatchEvent(new Event('input',{bubbles:true}));});
  await wait(300);
  await p.click('.rail .gate[data-p="review"]');await wait(300);
  await p.evaluate(()=>{const i=document.getElementById('fConfirmBy');if(i){i.value='B. McGurk';i.dispatchEvent(new Event('input',{bubbles:true}));}});
  await p.evaluate(()=>{const b=document.getElementById('btnConfirm');if(b)b.click();});await wait(350);
  await p.click('.rail .gate[data-p="generate"]');await wait(350);
  console.log('options: '+JSON.stringify(await p.evaluate(()=>[...document.querySelectorAll('#fSegment option')].map(o=>o.value))));
  for(const seg of ['SMB','COMM','ENT','STR']){
    await p.select('#fSegment',seg);await wait(300);
    console.log('  '+seg.padEnd(5)+' -> '+await p.evaluate(()=>document.getElementById('segmentHint').textContent.replace(/^.*named /,'')));
  }
  console.log('header shows: '+await p.evaluate(()=>document.getElementById('docLabel').textContent));
  await p.screenshot({path:'output/collapse-segment.png'});
  console.log(errs.length?'\nERRORS:\n  '+errs.join('\n  '):'\nNo console errors.');
  await b.close();
})();
