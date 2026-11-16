/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars -- Standalone browser QA evidence scripts. */
const { chromium } = require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const phase = process.env.QA_PHASE || 'baseline';
const out = path.join(__dirname, phase);
fs.mkdirSync(out, {recursive:true});
(async()=>{
 const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const notes=[];
 const snap=async(name,note)=>{await page.screenshot({path:path.join(out,name+'.png'),fullPage:true}); notes.push({name,note,url:page.url(),text:await page.locator('body').innerText()});fs.writeFileSync(path.join(out,'journey.json'),JSON.stringify(notes,null,2));};
 await page.goto('http://127.0.0.1:3001',{waitUntil:'networkidle'});
 await snap('01-landing','First impression: literal labels only.');
 const retry=page.getByRole('button',{name:'Retry collection'}); if(await retry.count()){await retry.click();await page.waitForTimeout(800);await snap('02-collection-retry','Retry collection still leaves no products.');}
 await page.getByRole('link',{name:'Discover the collection',exact:true}).click();await page.waitForLoadState('networkidle');
 await snap('03-shop','Expected purchasable collection from Discover the collection.');
 console.log('SHOP',await page.locator('body').innerText());
 console.log('BUTTONS',JSON.stringify(await page.getByRole('button').allTextContents()));
 const retryShop=page.getByRole('button',{name:/retry|try again/i});if(await retryShop.count()){await retryShop.first().click();await page.waitForTimeout(800);await snap('04-shop-retry','Retry does not recover purchasable products.');}
 await page.getByRole('button',{name:/bag/i}).first().click();await snap('05-bag','Bag opened from shopping page.');console.log('BAG',await page.locator('body').innerText());
 await page.goto('http://127.0.0.1:3001/account',{waitUntil:'networkidle'});await snap('06-account','Your account is the only sign up/account entry.');console.log('ACCOUNT',await page.locator('body').innerText());
 console.log('ACCOUNTLINKS',JSON.stringify(await page.getByRole('link').evaluateAll(es=>es.map(e=>({text:e.innerText,href:e.getAttribute('href')})))));
 const accountRetry=page.getByRole('button',{name:'Try again',exact:true}); if(await accountRetry.count()){await accountRetry.click();await page.waitForTimeout(600);await snap('07-account-retry','Account retry still unavailable.');}
 const signIn=page.getByRole('link',{name:'Back to sign in',exact:true});if(await signIn.count()){await signIn.click();await page.waitForTimeout(700);}else{await page.goto('http://127.0.0.1:3001/account/login');}
 await snap('08-login','Literal labels on sign in.');console.log('LOGIN',await page.locator('body').innerText());console.log('LOGINLINKS',JSON.stringify(await page.getByRole('link').evaluateAll(es=>es.map(e=>({text:e.innerText,href:e.getAttribute('href')})))));
 await browser.close();
})();
