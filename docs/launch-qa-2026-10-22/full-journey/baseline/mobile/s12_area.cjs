const {toContactDone}=require('./flow.cjs');const {shot}=require('./lib.cjs');const {withKeyboard}=require('./helpers.cjs');
(async()=>{
 const ctx=await toContactDone();const {page,browser}=ctx;
 const pick=async(btnName,optName,shotName)=>{const b=page.getByRole('combobox',{name:btnName}).or(page.locator('button[role=combobox]').filter({hasText:btnName})).first();await b.scrollIntoViewIfNeeded();await b.tap();await page.waitForTimeout(1200);if(shotName)await shot(page,shotName);const n=await page.getByRole('option').count();console.log(btnName,'options',n,await page.getByRole('option').allInnerTexts().then(a=>a.slice(0,8)));const o=optName?page.getByRole('option',{name:optName}).first():page.getByRole('option').nth(1);await o.tap();await page.waitForTimeout(1500);};
 await pick('Choose a state',/^Lagos/);
 await pick('Select an LGA if applicable',null,'12-lga-dropdown');
 await pick('Choose your exact area',null,'12-area-dropdown');
 await page.locator('input[autocomplete=street-address]').fill('1 Test Street');
 await page.locator('input[autocomplete=address-level2]').fill('Ikeja');
 await page.waitForTimeout(10000);
 const rev=page.getByRole('button',{name:/review order total/i});
 console.log('review disabled?',await rev.isDisabled());
 await rev.scrollIntoViewIfNeeded();await page.waitForTimeout(500);await shot(page,'12-ready-to-review');
 console.log(await page.evaluate(()=>[...document.querySelectorAll('input[type=radio],label')].filter(e=>e.getBoundingClientRect().width>0).map(e=>(e.innerText||e.name||e.value).replace(/\n/g,' ').slice(0,60)+' '+Math.round(e.getBoundingClientRect().height))));
 console.log((await page.evaluate(()=>document.body.innerText)).slice(150,700));
 await browser.close();
})();
