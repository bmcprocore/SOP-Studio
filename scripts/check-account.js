const puppeteer=require('puppeteer');const path=require('path');const {pathToFileURL}=require('url');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await puppeteer.launch({headless:'new'});const p=await b.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
  await p.setViewport({width:1500,height:950});
  await p.goto(pathToFileURL(path.resolve('app/SOP_Studio_v0.1.html')).href,{waitUntil:'networkidle0'});
  await wait(1400);
  console.log('account options: '+JSON.stringify(await p.evaluate(()=>[...document.querySelectorAll('#fAccount option')].map(o=>o.value))));
  await p.click('#btnSeed');await wait(450);
  await p.click('.rail .gate[data-p="create"]');await wait(300);
  await p.evaluate(()=>document.querySelector('#createTplList .tpl').click());await wait(650);

  // inject prose using the APAC term plus Procore tool names
  await p.click('.rail .gate[data-p="review"]');await wait(400);
  await p.evaluate(()=>document.getElementById('btnShowJson').click());await wait(300);
  await p.evaluate(()=>{
    const ta=document.getElementById('sopJson');const j=JSON.parse(ta.value);
    j.purpose='The Head contract sets this out. Prime Contracts hold the value. The Subcontractor submits. Invoicing follows.';
    ta.value=JSON.stringify(j,null,2);ta.dispatchEvent(new Event('change',{bubbles:true}));
  });
  await wait(600);

  const render=async(region,account)=>{
    await p.click('.rail .gate[data-p="create"]');await wait(220);
    await p.select('#fRegion',region);await wait(280);
    await p.select('#fAccount',account);await wait(280);
    await p.click('.rail .gate[data-p="review"]');await wait(320);
    if(await p.evaluate(()=>!!document.getElementById('btnConfirm'))){
      await p.evaluate(()=>{const i=document.getElementById('fConfirmBy');i.value='check';i.dispatchEvent(new Event('input',{bubbles:true}));});
      await p.evaluate(()=>document.getElementById('btnConfirm').click());await wait(320);
    }
    await p.click('.rail .gate[data-p="generate"]');await wait(220);
    await p.evaluate(()=>document.getElementById('btnRender2').click());await wait(2100);
    return p.evaluate(()=>{
      const d=document.getElementById('frame').contentDocument;
      const t=d.getElementById('viewer').innerText;
      const m=t.match(/The .{0,26} sets this out\. .{0,26} hold the value\. The .{0,20} submits\. .{0,22} follows\./);
      return m?m[0]:'(sentence not found)';
    });
  };

  for(const [r,a] of [['APAC','GC'],['NAMER','GC'],['NAMER','OWNER'],['NAMER','SPECIALTY'],['APAC','OWNER']]){
    console.log('\n'+r+' + '+a);
    console.log('  '+await render(r,a));
  }
  console.log(errs.length?'\nERRORS:\n  '+errs.join('\n  '):'\nNo console errors.');
  await b.close();
})();
