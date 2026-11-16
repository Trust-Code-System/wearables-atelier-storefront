const {launch,shot,audit,OUT,fs}=require('./lib.cjs');
(async()=>{
 const {browser,page,bytes,errs}=await launch();
 const t0=Date.now();
 await page.goto('http://localhost:3101/',{waitUntil:'commit',timeout:120000});
 // first useful tap: keep tapping the menu button until a dialog/nav shows
 let opened=null,firstTapAt=null,taps=0;
 const menuBtn=page.getByRole('button',{name:/menu/i}).first();
 await menuBtn.waitFor({state:'visible',timeout:60000});
 firstTapAt=Date.now()-t0;
 console.log('menu button visible at',firstTapAt, 'bytes',bytes.total);
 while(Date.now()-t0<90000){
   await menuBtn.tap({timeout:30000}).catch(e=>console.log('tap err',e.message.slice(0,80)));taps++;
   await page.waitForTimeout(1500);
   const expanded=await menuBtn.getAttribute('aria-expanded').catch(()=>null);
   const dlg=await page.locator('[role=dialog]:visible, nav:visible a').count();
   if(expanded==='true'||dlg>2){opened=Date.now()-t0;break;}
 }
 console.log({firstTapAt,taps,opened,bytes:bytes.total});
 await shot(page,'02-menu-open');
 console.log(await page.evaluate(()=>[...document.querySelectorAll('a:not([hidden]),button')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.top>=0&&r.top<innerHeight}).map(e=>(e.innerText||e.getAttribute('aria-label')||'').trim().slice(0,30)+' '+Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height)).join('\n')));
 console.log(JSON.stringify(await audit(page),null,1));
 console.log(errs);
 await browser.close();
})();
