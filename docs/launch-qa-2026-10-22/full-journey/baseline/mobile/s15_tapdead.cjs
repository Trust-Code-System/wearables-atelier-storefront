const {launch,shot,OUT,fs}=require('./lib.cjs');
(async()=>{
 const {browser,page,bytes}=await launch();
 const t0=Date.now();
 await page.goto('http://localhost:3101/',{waitUntil:'commit'});
 const btn=page.locator('button.store-mobile-menu');
 await btn.waitFor({state:'visible',timeout:60000});
 const log=[];
 let firstWorks=null;
 for(let i=0;i<40&&firstWorks==null;i++){
   const at=Date.now()-t0;
   await btn.tap({timeout:20000}).catch(()=>{});
   await page.waitForTimeout(1500);
   const open=await page.locator('[data-slot=sheet-content]').count();
   log.push({tapAtMs:at,open,bytes:bytes.total});
   if(open){firstWorks=Date.now()-t0;await shot(page,'15-menu-first-works');}
 }
 console.log(JSON.stringify(log),'first working tap result at ms',firstWorks);
 fs.writeFileSync(OUT+'/s15.json',JSON.stringify(log));
 await browser.close();
})();
