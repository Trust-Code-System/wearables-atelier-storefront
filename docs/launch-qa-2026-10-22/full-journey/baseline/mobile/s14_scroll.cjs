const {launch,shot,audit,OUT,fs}=require('./lib.cjs');
(async()=>{
 const {browser,page,bytes,errs}=await launch();
 await page.goto('http://localhost:3101/',{waitUntil:'commit'});
 await page.waitForFunction(()=>{const b=document.querySelector('.store-bag-button');return b&&!/checking/i.test(b.getAttribute('aria-label')||'')},null,{timeout:180000});
 await page.waitForTimeout(2000);
 const H=await page.evaluate(()=>document.documentElement.scrollHeight);console.log('H',H);
 let i=0;
 for(let y=700;y<H;y+=700){await page.evaluate(yy=>window.scrollTo(0,yy),y);await page.waitForTimeout(2500);i++;await shot(page,'14-landing-scroll-'+String(i).padStart(2,'0'));const a=await audit(page);console.log(i,'y',y,'small',JSON.stringify(a.small.map(s=>s.t+' '+s.w+'x'+s.h)),'hscroll',a.hscroll);}
 console.log('bytes after scroll',bytes.total,'images',await page.evaluate(()=>[...document.images].map(i=>({n:i.currentSrc.slice(-45),nat:i.naturalWidth+'x'+i.naturalHeight,disp:Math.round(i.getBoundingClientRect().width)+'x'+Math.round(i.getBoundingClientRect().height)}))));
 console.log('byType',bytes.byType);
 await browser.close();
})();
