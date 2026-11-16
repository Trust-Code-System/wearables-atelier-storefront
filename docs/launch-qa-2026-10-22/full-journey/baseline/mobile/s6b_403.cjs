const {launch,shot}=require('./lib.cjs');
(async()=>{
 const {browser,page,errs}=await launch({throttle:false});
 page.on('response',async r=>{if(/api-proxy/.test(r.url())&&r.request().method()!=='GET'||r.status()>=400){let b='';try{b=(await r.text()).slice(0,300)}catch{};console.log(r.request().method(),r.status(),r.url().replace('http://localhost:3101',''),b)}});
 for(const p of ['test-product','jewelery-test']){
 await page.goto('http://localhost:3101/product/'+p,{waitUntil:'networkidle'});
 await page.waitForTimeout(2000);
 const radios=page.getByRole('radio');const n=await radios.count();console.log(p,'sizes',n);
 if(n)await radios.first().tap();
 await page.waitForTimeout(500);
 const b=page.getByRole('button',{name:/add to bag/i}).first();
 console.log(await b.innerText());
 await b.tap();await page.waitForTimeout(3000);
 console.log(await page.evaluate(()=>document.querySelector('.store-bag-button')?.getAttribute('aria-label')));
 await shot(page,'06b-'+p);
 }
 await browser.close();
})();
