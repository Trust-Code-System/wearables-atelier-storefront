const {chromium}=require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const ctx=await browser.newContext({viewport:{width:1280,height:800}});const page=await ctx.newPage();
 page.on('request',r=>{if(r.method()!=='GET'&&/api-proxy/.test(r.url()))console.log('REQ',r.method(),r.url(),JSON.stringify(r.headers()).slice(0,400),r.postData())});
 page.on('response',async r=>{if(/api-proxy/.test(r.url())&&(r.request().method()!=='GET'||r.status()>=400))console.log(r.request().method(),r.status(),r.url().replace('http://localhost:3101',''),(await r.text().catch(()=>'')).slice(0,200),JSON.stringify(r.headers()).slice(0,300))});
 await page.goto('http://localhost:3101/product/test-product',{waitUntil:'networkidle'});await page.waitForTimeout(2000);
 await page.getByRole('radio').first().click();
 await page.getByRole('button',{name:/add to bag/i}).first().click();await page.waitForTimeout(3000);
 console.log(await page.evaluate(()=>document.body.innerText.match(/Unable[^\n]*/)));
 await browser.close();
})();
