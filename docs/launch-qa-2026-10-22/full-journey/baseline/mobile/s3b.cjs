const {launch,shot,audit,OUT,fs}=require('./lib.cjs');
(async()=>{
 const {browser,page,bytes,errs}=await launch();
 const t0=Date.now();
 page.on('request',r=>{if(!/_next\/static|_next\/image/.test(r.url()))console.log('REQ',Date.now()-t0,r.method(),r.url().slice(0,120))});
 page.on('response',r=>{if(!/_next\/static|_next\/image/.test(r.url()))console.log('RES',Date.now()-t0,r.status(),r.url().slice(0,120))});
 await page.goto('http://localhost:3101/shop',{waitUntil:'commit'});
 let done=null;
 for(let i=0;i<40;i++){await page.waitForTimeout(3000);const txt=await page.evaluate(()=>document.body.innerText);const prod=await page.locator('a[href^="/product"]').count();if(prod>0){done=Date.now()-t0;console.log('products visible',done,prod);break;}if(i%5==4)console.log(Date.now()-t0,'still:',txt.includes('Loading the collection')?'Loading the collection':'?',txt.includes('Checking available')?'Checking':'');}
 await shot(page,'03-shop-products');
 console.log(await page.evaluate(()=>[...document.querySelectorAll('a')].filter(a=>/product|shop\//.test(a.getAttribute('href'))).map(a=>a.getAttribute('href')+' | '+a.innerText.replace(/\n/g,' ').slice(0,60)).slice(0,30).join('\n')));
 console.log('bytes',bytes.total);
 await browser.close();
})();
