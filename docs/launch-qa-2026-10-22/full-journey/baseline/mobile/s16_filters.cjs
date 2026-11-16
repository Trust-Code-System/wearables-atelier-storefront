const {launch,shot,audit}=require('./lib.cjs');
(async()=>{
 const {browser,page}=await launch({throttle:false});
 await page.goto('http://localhost:3101/shop',{waitUntil:'networkidle'});await page.waitForTimeout(2000);
 const f=page.getByRole('button',{name:'Filters'});console.log('filters box',await f.boundingBox());
 await f.tap();await page.waitForTimeout(1200);await shot(page,'16-filters-sheet');
 console.log(await page.evaluate(()=>[...document.querySelectorAll('[role=dialog] button,[role=dialog] input,[role=dialog] label')].map(e=>(e.innerText||e.getAttribute('aria-label')||'').trim().slice(0,30)+' '+Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height))));
 await page.keyboard.press('Escape');await page.waitForTimeout(500);
 await page.getByRole('button',{name:'Search the collection'}).tap();await page.waitForTimeout(1200);await shot(page,'16-search');
 console.log(await page.evaluate(()=>[...document.querySelectorAll('input')].filter(e=>e.getBoundingClientRect().width>10).map(e=>e.type+' '+e.inputMode+' ac='+e.autocomplete+' fs='+getComputedStyle(e).fontSize)));
 await browser.close();
})();
