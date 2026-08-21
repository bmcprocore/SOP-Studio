// Pass 1 evidence: measure the interface rather than eyeball it.
const puppeteer=require('puppeteer');const path=require('path');const {pathToFileURL}=require('url');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await puppeteer.launch({headless:'new'});const p=await b.newPage();
  await p.setViewport({width:1600,height:1000});
  await p.goto(pathToFileURL(path.resolve('app/SOP_Studio_v0.1.html')).href,{waitUntil:'networkidle0'});
  await wait(1400);
  await p.click('#btnSeed');await wait(450);
  await p.click('.rail .gate[data-p="create"]');await wait(300);
  await p.evaluate(()=>document.querySelector('#createTplList .tpl').click());await wait(700);
  await p.click('.rail .gate[data-p="review"]');await wait(600);

  const R=await p.evaluate(()=>{
    const lum=c=>{const [r,g,bl]=c.map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});
      return 0.2126*r+0.7152*g+0.0722*bl;};
    const parse=s=>{const m=s.match(/\d+(\.\d+)?/g);return m?m.slice(0,3).map(Number):null;};
    const ratio=(f,bg)=>{const a=lum(f),c=lum(bg);const [hi,lo]=a>c?[a,c]:[c,a];return +(((hi+0.05)/(lo+0.05)).toFixed(2));};
    const bgOf=el=>{let n=el;while(n&&n!==document.documentElement){const c=getComputedStyle(n).backgroundColor;
      const v=parse(c); if(v&&!/rgba\(0, 0, 0, 0\)/.test(c)&&getComputedStyle(n).backgroundColor!=='transparent')return v; n=n.parentElement;}
      return [255,255,255];};

    // contrast on visible text
    const contrast=[];
    document.querySelectorAll('.hint,.note,.sub,.rule,.seg-note,.oid,.rev-count,.otitle,.blk2 .t,label,.dprev-cap,.status,footer.appbar,.rail-label,.rail .gate small').forEach(el=>{
      const r=el.getBoundingClientRect(); if(!r.width||!r.height) return;
      const cs=getComputedStyle(el); const fg=parse(cs.color); if(!fg) return;
      const size=parseFloat(cs.fontSize); const bold=parseInt(cs.fontWeight,10)>=700;
      const large=size>=24||(size>=18.66&&bold);
      const cr=ratio(fg,bgOf(el));
      const need=large?3:4.5;
      if(cr<need) contrast.push({sel:el.className||el.tagName,size:+size.toFixed(1),ratio:cr,need,
        text:(el.textContent||'').replace(/\s+/g,' ').trim().slice(0,42)});
    });
    const seen=new Set(); const contrastFails=contrast.filter(c=>{const k=c.sel+c.ratio;if(seen.has(k))return false;seen.add(k);return true;});

    // interactive elements: name + size + keyboard reachability
    const inter=[...document.querySelectorAll('button,a[href],input,select,textarea,[tabindex]')].filter(e=>e.offsetParent!==null);
    const noName=inter.filter(e=>{
      const t=(e.textContent||'').trim(); const al=e.getAttribute('aria-label');
      const lab=e.id?document.querySelector('label[for="'+e.id+'"]'):null;
      const ti=e.getAttribute('title');
      return !t&&!al&&!lab&&!ti;
    }).map(e=>e.tagName+(e.id?'#'+e.id:'')+(e.className?'.'+String(e.className).split(' ')[0]:''));
    const small=inter.filter(e=>{const r=e.getBoundingClientRect();return r.height>0&&(r.height<24||r.width<24);})
      .map(e=>({el:e.tagName+(e.className?'.'+String(e.className).split(' ')[0]:''),w:Math.round(e.getBoundingClientRect().width),h:Math.round(e.getBoundingClientRect().height)}));
    const smallSeen=new Set(); const smallTargets=small.filter(s=>{const k=s.el+s.w+s.h;if(smallSeen.has(k))return false;smallSeen.add(k);return true;});

    // headings, landmarks, images
    const heads=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(h=>h.offsetParent!==null).map(h=>h.tagName+' '+(h.textContent||'').trim().slice(0,34));
    const imgs=[...document.querySelectorAll('img')].map(i=>({src:(i.getAttribute('src')||'').slice(0,18),alt:i.getAttribute('alt')}));
    const landmarks={nav:document.querySelectorAll('nav').length,main:document.querySelectorAll('main').length,
      header:document.querySelectorAll('header').length,footer:document.querySelectorAll('footer').length,
      aside:document.querySelectorAll('aside').length};

    // colour-only signalling: excluded rows
    const dropped=document.querySelector('#blockList .blk2.out');
    const droppedCue={strikeThrough:dropped?getComputedStyle(dropped.querySelector('.t')||dropped).textDecorationLine:'n/a',
      opacity:dropped?getComputedStyle(dropped).opacity:'n/a',
      hasTextReason:dropped?/Needs|Requires/.test(dropped.textContent):false};

    // drag-and-drop keyboard alternative?
    const draggables=document.querySelectorAll('[draggable="true"]').length;
    const moveButtons=document.querySelectorAll('.ord:not(.del)').length;

    return {contrastFails,noName,smallTargets,heads,imgs,landmarks,droppedCue,
      draggables,moveButtons,
      interactiveCount:inter.length,
      liveRegions:document.querySelectorAll('[aria-live]').length,
      requiredMarked:document.querySelectorAll('[required],[aria-required="true"]').length,
      reqStars:document.querySelectorAll('.req').length,
      fieldsTotal:document.querySelectorAll('input,select,textarea').length};
  });

  // keyboard: how many tabs to reach the confirm button
  await p.evaluate(()=>document.body.focus());
  let tabs=0,found=false;
  for(let i=0;i<120;i++){await p.keyboard.press('Tab');tabs++;
    const id=await p.evaluate(()=>document.activeElement&&document.activeElement.id);
    if(id==='btnConfirm'){found=true;break;}}
  console.log(JSON.stringify(R,null,1));
  console.log('\nTabs from page start to the Confirm button: '+(found?tabs:'not reached in 120'));
  await b.close();
})();
