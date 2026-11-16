const {launch,shot}=require('./lib.cjs');
(async()=>{
 const {browser,page,errs}=await launch({throttle:false});
 page.on('response',async r=>{if(/api-proxy/.test(r.url())&&(r.request().method()!=='GET'||r.status()>=400))console.log(r.request().method(),r.status(),r.url().replace('http://localhost:3101',''))});
 await page.goto('http://localhost:3101/shop',{waitUntil:'networkidle'});await page.waitForTimeout(2000);
 const b=page.getByRole('button',{name:/Add Jewelery test to bag/});await b.scrollIntoViewIfNeeded();await b.tap();await page.waitForTimeout(3000);await shot(page,'07-quickadd-result');
 console.log(await page.evaluate(()=>(document.body.innerText.match(/(Unable|Added|Your bag)[^\n]*/g))), await page.evaluate(()=>document.querySelector('.store-bag-button')?.getAttribute('aria-label')));
 await browser.close();
})();
