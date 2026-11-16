const {launch,shot,audit,OUT,fs}=require('./lib.cjs');
(async()=>{
 const {browser,page,bytes,errs}=await launch();
 const T0=Date.now();
 const mark=(n,e)=>console.log(JSON.stringify({step:n,atSec:((Date.now()-T0)/1000).toFixed(1),bytes:bytes.total,...e}));
 await page.goto('http://localhost:3101/product/test-product',{waitUntil:'commit'});
 await page.getByRole('radio',{name:'6'}).waitFor({timeout:180000});
 await page.waitForFunction(()=>{const b=document.querySelector('.store-bag-button');return b&&!/checking/i.test(b.getAttribute('aria-label')||'')},null,{timeout:180000});
 mark('PDP interactive');
 // scroll like a thumb: swipe
 await page.evaluate(()=>window.scrollTo(0,0));
 // scroll down to size section
 await page.evaluate(()=>window.scrollTo(0,520)); await page.waitForTimeout(1000); await shot(page,'06-pdp-scrolled-1');
 await page.evaluate(()=>window.scrollTo(0,1000)); await page.waitForTimeout(1000); await shot(page,'06-pdp-scrolled-2');
 // add without size first
 let s=Date.now();
 const addBtn=page.getByRole('button',{name:/choose a size|add to bag/i}).first();
 console.log('add btn label:',await addBtn.innerText(),'disabled:',await addBtn.isDisabled(), 'aria-disabled',await addBtn.getAttribute('aria-disabled'));
 await addBtn.tap({force:true}).catch(e=>console.log('tap no-size err',e.message.slice(0,100)));
 await page.waitForTimeout(1500); await shot(page,'06-pdp-add-without-size');
 console.log('after no-size tap body hint:', (await page.evaluate(()=>document.body.innerText)).match(/(select|choose)[^\n]*size[^\n]*/gi));
 // pick size
 s=Date.now();
 await page.getByRole('radio',{name:'8'}).tap();
 await page.waitForTimeout(800); await shot(page,'06-pdp-size-selected');
 mark('size tapped',{ms:Date.now()-s});
 console.log('add btn now:',await page.getByRole('button',{name:/add to bag|choose a size/i}).first().innerText());
 // keep viewport so button visible
 const btn=page.getByRole('button',{name:/add to bag/i}).first();
 const r=await btn.boundingBox();console.log('add btn box',r,'viewport h 812');
 await btn.scrollIntoViewIfNeeded();
 s=Date.now();
 await btn.tap();
 mark('tapped add to bag');
 for(const ms of [300,1500,4000,8000]){await page.waitForTimeout(ms-(Date.now()-s)>0?ms-(Date.now()-s):0);await shot(page,'06-after-add-t'+ms);console.log('t',ms,await page.evaluate(()=>document.querySelector('.store-bag-button')?.getAttribute('aria-label')),!!(await page.locator('[role=dialog]').count()));}
 console.log(await page.evaluate(()=>{const d=document.querySelector('[role=dialog]');return d?d.innerText:'no dialog'}));
 console.log(await page.evaluate(()=>[...document.querySelectorAll('[role=dialog] button,[role=dialog] a,[role=dialog] input')].map(e=>e.tagName+' "'+(e.innerText||e.getAttribute('aria-label')||e.getAttribute('placeholder')||'').trim().slice(0,40)+'" '+Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height)).join('\n')));
 console.log(JSON.stringify(errs.console),JSON.stringify(errs.page));
 await browser.close();
})();
