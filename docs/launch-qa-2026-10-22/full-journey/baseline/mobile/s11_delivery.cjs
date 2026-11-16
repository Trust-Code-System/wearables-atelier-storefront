const {toContactDone}=require('./flow.cjs');const {shot}=require('./lib.cjs');const {withKeyboard}=require('./helpers.cjs');
(async()=>{
 const ctx=await toContactDone();const {page,browser}=ctx;
 const state=page.getByRole('combobox').first();
 console.log('state control:',await page.evaluate(()=>[...document.querySelectorAll('select,[role=combobox]')].map(e=>e.tagName+' '+e.getAttribute('role')+' '+Math.round(e.getBoundingClientRect().height))));
 await state.scrollIntoViewIfNeeded();await state.tap();await page.waitForTimeout(1200);await shot(page,'11-state-dropdown');
 console.log('options visible:',await page.getByRole('option').count());
 const opt=page.getByRole('option',{name:/^Lagos/});
 console.log('lagos opt box',await opt.first().boundingBox().catch(()=>null));
 await opt.first().tap().catch(e=>console.log('opt err',e.message.slice(0,100)));
 await page.waitForTimeout(1500);await shot(page,'11-state-chosen');
 console.log('addr',JSON.stringify(await withKeyboard(page,page.locator('input[autocomplete=street-address]'),'1 Test Street','11-kb-street')));
 console.log('city',JSON.stringify(await withKeyboard(page,page.locator('input[autocomplete=address-level2]'),'Ikeja','11-kb-city')));
 await page.waitForTimeout(8000);await shot(page,'11-after-address');
 console.log((await page.evaluate(()=>document.body.innerText)).slice(0,900));
 console.log(await page.evaluate(()=>[...document.querySelectorAll('input,button,select,[role=combobox],[role=radio],label')].filter(e=>e.getBoundingClientRect().width>0&&e.closest('main,form')).map(e=>e.tagName+' type='+(e.type||'')+' ac='+(e.autocomplete||'')+' "'+(e.innerText||e.getAttribute('aria-label')||e.placeholder||e.name||e.value||'').replace(/\n/g,' ').trim().slice(0,40)+'" '+Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height)+' y'+Math.round(e.getBoundingClientRect().top+scrollY)).join('\n')));
 await browser.close();
})();
