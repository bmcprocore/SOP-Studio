const puppeteer=require('puppeteer');const path=require('path');const {pathToFileURL}=require('url');
const fs=require('fs');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await puppeteer.launch({headless:'new'});const p=await b.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
  await p.setViewport({width:1600,height:1000});
  await p.goto(pathToFileURL(path.resolve('app/SOP_Studio_v0.1.html')).href,{waitUntil:'networkidle0'});await wait(1400);
  await p.click('#btnSeed');await wait(450);
  await p.click('.rail .gate[data-p="create"]');await wait(250);
  await p.evaluate(()=>document.querySelector('#createTplList .tpl').click());await wait(700);
  await p.click('.rail .gate[data-p="permissions"]');await wait(250);
  await p.click('#permSeg button[data-v="Standard"]');await wait(400);
  await p.click('.rail .gate[data-p="details"]');await wait(250);
  await p.evaluate(()=>{const e=document.getElementById('fCustomer');e.value='Client name';e.dispatchEvent(new Event('input',{bubbles:true}));});
  await wait(300);
  await p.click('.rail .gate[data-p="review"]');await wait(400);
  await p.evaluate(()=>{const i=document.getElementById('fConfirmBy');i.value='check';i.dispatchEvent(new Event('input',{bubbles:true}));});
  await p.evaluate(()=>document.getElementById('btnConfirm').click());await wait(400);
  await p.click('.rail .gate[data-p="generate"]');await wait(250);
  await p.evaluate(()=>document.getElementById('btnRender2').click());await wait(2600);

  const r=await p.evaluate(()=>{
    const d=document.getElementById('frame').contentDocument;
    const txt=d.getElementById('viewer').innerText;
    const lvl=d.querySelector('.access-panel .lvl-value');
    const mean=d.querySelector('.access-panel .lvl-meaning');
    const sigs=[...d.querySelectorAll('.signoff .sig')].map(s=>{const r=s.getBoundingClientRect();return Math.round(r.left)+':'+Math.round(r.width);});
    const dates=[...d.querySelectorAll('.signoff .sig .date')].map(s=>{const r=s.getBoundingClientRect();return Math.round(r.left)+':'+Math.round(r.width);});
    return {
      pages:d.querySelectorAll('#viewer .page').length,
      accessLevel:lvl?lvl.textContent.trim():'(missing)',
      accessMeaning:mean?mean.textContent.trim().slice(0,80):'(missing)',
      cannotDoRows:d.querySelectorAll('.access-panel .perm-table tbody tr').length,
      placeholdersLeft:(txt.match(/\[(Intro[^\]]*|Permission level|What this access[^\]]*)\]/g)||[]),
      signoffColumns:sigs, signoffDateRows:dates,
      procedureIntro:(txt.match(/Follow these steps[^\n]{0,60}/)||['(missing)'])[0],
      closeoutMentionsSupport:/support\.procore\.com/i.test(txt)
    };});
  console.log(JSON.stringify(r,null,1));
  console.log(errs.length?'\nERRORS: '+errs.join(' | '):'\nNo console errors.');
  await b.close();
})();
