const {launch,shot}=require('./lib.cjs');const mock=require('./mock.cjs');const {withKeyboard}=require('./helpers.cjs');
async function toContactDone(){
 const ctx=await launch();const {page,bytes,errs}=ctx;
 const T0=Date.now();ctx.mark=(n,e)=>console.log(JSON.stringify({step:n,atSec:((Date.now()-T0)/1000).toFixed(1),bytes:bytes.total,...e}));
 await mock(page);
 page.on('response',async r=>{if(/api-proxy/.test(r.url())&&(r.status()>=400||(r.request().method()!=='GET'&&!/store\/cart/.test(r.url()))))console.log('  RES',r.request().method(),r.status(),r.url().slice(-90),(await r.text().catch(()=>'')).slice(0,250))});
 await page.goto('http://localhost:3101/product/test-product',{waitUntil:'commit'});
 await page.getByRole('radio',{name:'6'}).waitFor({timeout:180000});
 await page.waitForFunction(()=>{const b=document.querySelector('.store-bag-button');return b&&!/checking/i.test(b.getAttribute('aria-label')||'')},null,{timeout:180000});
 await page.getByRole('radio',{name:'6'}).tap();
 await page.getByRole('button',{name:/add to bag/i}).first().tap();
 await page.getByText('Your Bag').first().waitFor({timeout:60000});await page.waitForTimeout(800);
 await page.getByRole('button',{name:/^Checkout/}).first().tap();
 await page.waitForURL('**/checkout**',{timeout:120000});
 await page.locator('input[autocomplete=name]').waitFor({timeout:120000});
 ctx.mark('checkout form visible');
 await page.locator('input[autocomplete=name]').fill('QA Tester');
 await page.locator('input[type=email]').fill(`qa-mobile-${Math.floor(Date.now()/1000)}@example.com`);
 await page.locator('input[type=tel]').fill('+2348000000000');
 await page.getByRole('button',{name:/continue to delivery/i}).tap();
 await page.locator('input[autocomplete=street-address]').waitFor({timeout:120000});
 ctx.mark('step 2 visible');
 return ctx;
}
module.exports={toContactDone};
