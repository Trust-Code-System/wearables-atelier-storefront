const {launch,shot,audit,OUT,fs}=require('./lib.cjs');
(async()=>{
 const {browser,page,bytes,errs}=await launch();
 await page.goto('http://localhost:3101/',{waitUntil:'networkidle',timeout:120000});
 console.log('cart btn html', await page.evaluate(()=>{const b=document.querySelector('header button:last-of-type, header [aria-label*=ag]');return [...document.querySelectorAll('header button, header a')].map(e=>e.outerHTML.slice(0,300))}));
 const menuBtn=page.getByRole('button',{name:/open menu/i}).first();
 let t=Date.now();
 await menuBtn.tap();
 await shot(page,'02-menu-t0');
 await page.waitForTimeout(1500); await shot(page,'02-menu-t1500');
 console.log('tap->',Date.now()-t, await menuBtn.getAttribute('aria-expanded'));
 console.log(await page.evaluate(()=>[...document.querySelectorAll('[role=dialog],nav')].map(e=>e.tagName+' '+e.className+' '+Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height)+' vis:'+getComputedStyle(e).visibility)));
 console.log(JSON.stringify((await audit(page)).small,null,1));
 await browser.close();
})();
