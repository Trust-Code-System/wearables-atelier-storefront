/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars -- Standalone browser QA evidence scripts. */
const { chromium } = require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'), path=require('node:path');
const phase=process.argv[2]||'baseline', out=path.join(__dirname,phase); fs.mkdirSync(out,{recursive:true});
(async()=>{
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const p=await b.newPage({viewport:{width:1365,height:900}});const results=[];
for(const route of ['/account/login','/account/register','/account/forgot-password']){
 await p.goto('http://127.0.0.1:3001'+route,{waitUntil:'domcontentloaded'});await p.waitForTimeout(1600);
 const fields=p.locator('input:not([aria-hidden="true"])');
 for(let i=0;i<await fields.count();i++){const f=fields.nth(i);if(await f.isVisible() && await f.isEnabled()) await f.fill(await f.getAttribute('type')==='password'?'1':'<script>junk</script>@@');}
 const submit=p.locator('button[type="submit"]');
 const disabled=await submit.count()?await submit.first().isDisabled():null;
 if(await submit.count() && !disabled) await submit.first().click({clickCount:2});
 const name='form-'+route.split('/').pop();
 await p.screenshot({path:path.join(out,name+'.png'),fullPage:true});
 results.push({route,submitDisabled:disabled,text:await p.locator('body').innerText(),validity:await fields.evaluateAll(es=>es.map(e=>({id:e.id,valid:e.checkValidity(),validationMessage:e.validationMessage}))) });
}
fs.writeFileSync(path.join(out,'forms.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
