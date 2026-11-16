const {chromium}=require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('path');const fs=require('fs');
const OUT=__dirname;
const UA='Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';
async function launch({throttle=true}={}){
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const context=await browser.newContext({viewport:{width:375,height:812},deviceScaleFactor:2,isMobile:true,hasTouch:true,userAgent:UA});
  const page=await context.newPage();
  const cdp=await context.newCDPSession(page);
  await cdp.send('Network.enable');
  if(throttle){
    await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:400,downloadThroughput:50000,uploadThroughput:50000});
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  }
  const bytes={total:0,byType:{},reqs:[]};
  const sizes=new Map();
  cdp.on('Network.responseReceived',e=>{sizes.set(e.requestId,{url:e.response.url,type:e.type,status:e.response.status});});
  cdp.on('Network.loadingFinished',e=>{const s=sizes.get(e.requestId);const n=e.encodedDataLength||0;bytes.total+=n;if(s){bytes.byType[s.type]=(bytes.byType[s.type]||0)+n;bytes.reqs.push({url:s.url.replace('http://localhost:3101',''),type:s.type,status:s.status,bytes:n});}});
  const errs={console:[],page:[],failed:[],http:[]};
  page.on('console',m=>{if(m.type()==='error')errs.console.push(m.text())});
  page.on('pageerror',e=>errs.page.push(e.message));
  page.on('requestfailed',r=>errs.failed.push(r.url()+' '+(r.failure()&&r.failure().errorText)));
  page.on('response',r=>{if(r.status()>=400)errs.http.push(r.status()+' '+r.url())});
  return {browser,context,page,cdp,bytes,errs};
}
async function shot(page,name){await page.screenshot({path:path.join(OUT,name+'.png'),fullPage:false,timeout:60000});}
// audit visible interactive elements for tap target size
async function audit(page){
  return page.evaluate(()=>{
    const vw=innerWidth;
    const els=[...document.querySelectorAll('a,button,input,select,textarea,[role=button],summary')];
    const small=[];
    for(const e of els){const r=e.getBoundingClientRect();const s=getComputedStyle(e);
      if(r.width<=0||r.height<=0||s.visibility==='hidden'||s.display==='none')continue;
      if(r.bottom<0||r.top>innerHeight)continue;
      if(r.width<44||r.height<44)small.push({t:(e.innerText||e.getAttribute('aria-label')||e.getAttribute('placeholder')||e.tagName).trim().slice(0,40),tag:e.tagName,w:Math.round(r.width),h:Math.round(r.height),x:Math.round(r.left),y:Math.round(r.top)});}
    const fonts=[];
    for(const e of document.querySelectorAll('body *')){if(!e.childNodes.length)continue;let hasText=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>2);if(!hasText)continue;const r=e.getBoundingClientRect();if(r.width<=0||r.height<=0||r.bottom<0||r.top>innerHeight)continue;const fs=parseFloat(getComputedStyle(e).fontSize);if(fs<12)fonts.push({t:e.textContent.trim().slice(0,30),fs});}
    return {vw,docW:document.documentElement.scrollWidth,hscroll:document.documentElement.scrollWidth>vw+1,small,tinyText:fonts.slice(0,15),scrollH:document.documentElement.scrollHeight};
  });
}
module.exports={launch,shot,audit,OUT,fs,path};
