const {launch,shot,audit,OUT,fs}=require('./lib.cjs');
(async()=>{
 const {browser,page,bytes,errs}=await launch();
 const t0=Date.now();const marks={};
 await page.goto('http://localhost:3101/shop',{waitUntil:'commit',timeout:120000});
 marks.commit=Date.now()-t0;
 for(const s of [4,10,20]){const w=s*1000-(Date.now()-t0);if(w>0)await page.waitForTimeout(w);await shot(page,'03-shop-cold-t'+s+'s');console.log('t',s,'bytes',bytes.total);}
 await page.waitForLoadState('networkidle',{timeout:180000}).catch(()=>{});
 marks.networkidle=Date.now()-t0;
 await shot(page,'03-shop-idle');
 const a=await audit(page);
 const imgs=await page.evaluate(()=>[...document.images].map(i=>({src:i.currentSrc.replace(location.origin,'').slice(0,90),nat:i.naturalWidth+'x'+i.naturalHeight,disp:Math.round(i.getBoundingClientRect().width)+'x'+Math.round(i.getBoundingClientRect().height),loading:i.loading})).slice(0,40));
 console.log(JSON.stringify({marks,bytes:bytes.total,byType:bytes.byType,nreq:bytes.reqs.length,audit:a,imgs,errs},null,1));
 console.log(await page.evaluate(()=>[...document.querySelectorAll('a')].map(a=>a.getAttribute('href')+' | '+a.innerText.replace(/\n/g,' ').slice(0,60)).join('\n')));
 console.log(await page.evaluate(()=>[...document.querySelectorAll('button')].map(a=>(a.innerText||a.getAttribute('aria-label')).replace(/\n/g,' ').slice(0,50)+' '+Math.round(a.getBoundingClientRect().width)+'x'+Math.round(a.getBoundingClientRect().height)).join('\n')));
 await browser.close();
})();
