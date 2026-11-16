const {launch,shot}=require('./lib.cjs');
(async()=>{
 const {browser,page,errs}=await launch({throttle:false});
 const line={id:'line-1',lineId:'line-1',productId:'0613ec05-cd01-4088-aa2a-ac8d277ffec9',variantId:'122195f0-5741-4a9c-9219-c0cb76439367',productSlug:'test-product',slug:'test-product',productName:'Test Product',name:'Test Product',title:'Test Product',sizeLabel:'6',size:'6',quantity:1,unitPriceKobo:'18500000',priceKobo:'18500000',lineTotalKobo:'18500000',totalKobo:'18500000',imageUrl:null,image:null,available:22,category:'CLOTHING',productVariantId:'122195f0-5741-4a9c-9219-c0cb76439367',itemId:'122195f0-5741-4a9c-9219-c0cb76439367',sku:'TP-6',lineId:'122195f0-5741-4a9c-9219-c0cb76439367',id:'122195f0-5741-4a9c-9219-c0cb76439367',status:'ok',issues:[],issue:null,unitPriceKobo:'18500000',variant:{id:'122195f0-5741-4a9c-9219-c0cb76439367',sizeLabel:'6',priceKobo:'18500000',available:22},product:{id:'0613ec05-cd01-4088-aa2a-ac8d277ffec9',name:'Test Product',slug:'test-product',category:'CLOTHING',images:[]}};
 const cart={id:'cart-1',owner:'guest',expiresAt:null,data:[line],meta:{lineCount:1,itemCount:1,lineLimit:20,quantityLimit:99},currency:'NGN',subtotalKobo:'18500000',subtotalComplete:true,hasIssues:false};
 let added=false;
 await page.route('**/api-proxy/api/v1/store/cart**',async route=>{const m=route.request().method();console.log('cart',m,route.request().url().slice(-40));
   if(m==='POST'||m==='PUT'||m==='PATCH'){added=true;return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(cart)});}
   if(m==='GET'&&added)return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(cart)});
   return route.continue();});
 await page.goto('http://localhost:3101/product/test-product',{waitUntil:'networkidle'});await page.waitForTimeout(1500);
 await page.getByRole('radio').first().tap();
 await page.getByRole('button',{name:/add to bag/i}).first().tap();await page.waitForTimeout(3000);
 await shot(page,'08-mock-bag');
 console.log(await page.evaluate(()=>document.body.innerText.slice(0,500)),errs.page,errs.console);
 await browser.close();
})();
