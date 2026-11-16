const {toContactDone}=require('./flow.cjs');const {shot}=require('./lib.cjs');
(async()=>{
 const ctx=await toContactDone();const {page,browser}=ctx;
 const pick=async(btnName,optName)=>{const b=page.locator('button[role=combobox]').filter({hasText:btnName}).first();await b.scrollIntoViewIfNeeded();await b.tap();await page.waitForTimeout(1500);const o=optName?page.getByRole('option',{name:optName}).first():page.getByRole('option').nth(1);await o.tap();await page.waitForTimeout(1500);};
 await pick('Choose a state',/^Lagos/);await pick('Select an LGA if applicable',null);await pick('Choose your exact area',null);
 await page.locator('input[autocomplete=street-address]').fill('1 Test Street');
 await page.locator('input[autocomplete=address-level2]').fill('Ikeja');
 const r=page.locator('input[name=delivery-method]').first();await r.waitFor({state:'attached',timeout:60000});
 console.log('radio visual box',await r.boundingBox(), 'label box',await r.evaluate(e=>{const l=e.closest('label');const b=l&&l.getBoundingClientRect();return b&&{w:b.width,h:b.height}}));
 await r.scrollIntoViewIfNeeded();
 await r.evaluate(e=>e.closest('label')?.click());await page.waitForTimeout(3000);
 console.log('review disabled after select?',await page.getByRole('button',{name:/review order total/i}).isDisabled());
 await page.getByRole('button',{name:/review order total/i}).scrollIntoViewIfNeeded();await page.waitForTimeout(600);await shot(page,'13-delivery-selected');
 console.log((await page.evaluate(()=>document.body.innerText)).match(/Delivery\n[^\n]*\nTotal\n[^\n]*/g));
 await browser.close();
})();
