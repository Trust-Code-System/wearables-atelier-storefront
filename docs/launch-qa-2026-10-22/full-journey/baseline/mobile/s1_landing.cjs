const {launch,shot,audit,OUT,fs}=require('./lib.cjs');
(async()=>{
 const {browser,page,bytes,errs}=await launch();
 const t0=Date.now();
 const marks={};
 page.on('domcontentloaded',()=>marks.dcl=Date.now()-t0);
 page.on('load',()=>marks.load=Date.now()-t0);
 await page.goto('http://localhost:3101/',{waitUntil:'commit',timeout:120000});
 marks.commit=Date.now()-t0;
 // shots at intervals to see loading state
 for(const s of [3,8,15]){ await page.waitForTimeout(s*1000-(Date.now()-t0)>0?s*1000-(Date.now()-t0):0); await shot(page,'01-landing-t'+s+'s'); console.log('shot t'+s, Date.now()-t0, 'bytes so far', bytes.total);}
 // time to first interactive link visible
 try{await page.waitForSelector('a:visible, button:visible',{timeout:60000});marks.firstTappable=Date.now()-t0;}catch(e){}
 await page.waitForLoadState('networkidle',{timeout:120000}).catch(()=>{});
 marks.networkidle=Date.now()-t0;
 await shot(page,'01-landing-idle');
 const a=await audit(page);
 const top=bytes.reqs.sort((x,y)=>y.bytes-x.bytes).slice(0,15);
 const out={marks,bytes:bytes.total,byType:bytes.byType,top,audit:a,errs,nreq:bytes.reqs.length};
 fs.writeFileSync(OUT+'/s1.json',JSON.stringify(out,null,2));
 console.log(JSON.stringify(out,null,1));
 await browser.close();
})();
