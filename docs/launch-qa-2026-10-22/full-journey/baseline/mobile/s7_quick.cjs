const {launch,shot}=require('./lib.cjs');
(async()=>{
 const {browser,page,errs}=await launch({throttle:false});
 page.on('response',async r=>{if(/api-proxy/.test(r.url())&&(r.request().method()!=='GET'||r.status()>=400))console.log(r.request().method(),r.status(),r.url().replace('http://localhost:3101',''))});
 await page.goto('http://localhost:3101/shop',{waitUntil:'networkidle'});await page.waitForTimeout(2000);
 const plus=page.locator('button[aria-label*="bag" i], button[aria-label*="add" i]');
 console.log(await plus.evaluateAll(a=>a.map(e=>e.getAttribute('aria-label')+' '+Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height))));
 await plus.first().scrollIntoViewIfNeeded();await plus.first().tap();await page.waitForTimeout(3000);await shot(page,'07-quickadd');
 console.log(await page.evaluate(()=>document.body.innerText.match(/(Unable|Added|bag)[^\n]*/g)));
 await page.goto('http://localhost:3101/checkout',{waitUntil:'networkidle'});await page.waitForTimeout(2000);await shot(page,'07-checkout-empty');
 console.log(page.url(), (await page.evaluate(()=>document.body.innerText)).slice(0,600));
 await browser.close();
})();
