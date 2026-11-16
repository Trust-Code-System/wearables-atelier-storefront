const {launch}=require('./lib.cjs');
(async()=>{
 const {browser,page,errs}=await launch({throttle:false});
 const rs=[];page.on('response',async r=>{if(/storageapi/.test(r.url()))rs.push(r.status()+' '+(r.headers()['content-type'])+' '+(r.headers()['x-content-type-options']||'')+' '+r.url().slice(0,90))});
 await page.goto('http://localhost:3101/product/test-product',{waitUntil:'networkidle'});
 await page.waitForTimeout(3000);
 console.log(rs);
 console.log(await page.evaluate(()=>[...document.images].map(i=>i.currentSrc.slice(0,80)+' '+i.naturalWidth)));
 console.log(errs.failed.map(s=>s.slice(-60)));
 await browser.close();
})();
