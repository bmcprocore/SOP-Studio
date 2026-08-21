const puppeteer=require('puppeteer');const path=require('path');const {pathToFileURL}=require('url');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await puppeteer.launch({headless:'new'});const p=await b.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
  await p.setViewport({width:1600,height:1000});
  const url=pathToFileURL(path.resolve('app/SOP_Studio_v0.1.html')).href;
  await p.goto(url,{waitUntil:'networkidle0'});await wait(1400);
  await p.click('#btnSeed');await wait(400);
  await p.click('.rail .gate[data-p="create"]');await wait(250);
  await p.evaluate(()=>document.querySelector('#createTplList .tpl').click());await wait(600);

  const run=async(region)=>{
    await p.click('.rail .gate[data-p="create"]');await wait(200);
    await p.select('#fRegion',region);await wait(350);
    await p.click('.rail .gate[data-p="review"]');await wait(300);
    if(await p.evaluate(()=>!!document.getElementById('btnConfirm'))){
      await p.evaluate(()=>{const i=document.getElementById('fConfirmBy');i.value='check';i.dispatchEvent(new Event('input',{bubbles:true}));});
      await p.evaluate(()=>document.getElementById('btnConfirm').click());await wait(300);}
    await p.click('.rail .gate[data-p="generate"]');await wait(200);
    await p.evaluate(()=>document.getElementById('btnRender2').click());await wait(2400);
    return p.evaluate(()=>{
      const d=document.getElementById('frame').contentDocument;
      const pg=d.querySelector('#viewer .page');
      const r=pg?pg.getBoundingClientRect():{width:0,height:0};
      const measure=d.getElementById('sop-measure-body');
      const mr=measure?measure.getBoundingClientRect():{width:0,height:0};
      return {pages:d.querySelectorAll('#viewer .page').length,
              pagePx:Math.round(r.width)+'x'+Math.round(r.height),
              measureBodyPx:Math.round(mr.width)+'x'+Math.round(mr.height),
              overridePresent:!!d.getElementById('pagesize'),
              hint:document.getElementById('regionHint').textContent.match(/Pages export at [A-Za-z0-9 ]+/)};
    });
  };
  for(const r of ['NAMER','APAC','TBC']){
    const res=await run(r);
    console.log(r.padEnd(6)+JSON.stringify({pages:res.pages,page:res.pagePx,body:res.measureBodyPx,override:res.overridePresent}));
    console.log('       hint: '+(res.hint?res.hint[0]:'(none)'));
  }
  // exported file carries the override
  await p.click('.rail .gate[data-p="create"]');await wait(200);
  await p.select('#fRegion','APAC');await wait(350);
  await p.click('.rail .gate[data-p="review"]');await wait(300);
  if(await p.evaluate(()=>!!document.getElementById('btnConfirm'))){
    await p.evaluate(()=>{const i=document.getElementById('fConfirmBy');i.value='check';i.dispatchEvent(new Event('input',{bubbles:true}));});
    await p.evaluate(()=>document.getElementById('btnConfirm').click());await wait(300);}
  const exported=await p.evaluate(()=>{
    const fn=[...document.querySelectorAll('script')];
    return null;});
  console.log(errs.length?'\nERRORS:\n  '+errs.join('\n  '):'\nNo console errors.');
  await b.close();
})();
