// TEST TOOLING: fakes the bag add (real POST /store/cart returns 403 Forbidden in this build)
module.exports=async function mockCart(page){
 const V='122195f0-5741-4a9c-9219-c0cb76439367';
 const line={id:V,lineId:V,itemId:V,productId:'0613ec05-cd01-4088-aa2a-ac8d277ffec9',variantId:V,productVariantId:V,productSlug:'test-product',slug:'test-product',productName:'Test Product',name:'Test Product',title:'Test Product',sizeLabel:'6',size:'6',quantity:1,unitPriceKobo:'18500000',priceKobo:'18500000',lineTotalKobo:'18500000',totalKobo:'18500000',imageUrl:null,available:22,category:'CLOTHING',status:'ok',issues:[],variant:{id:V,sizeLabel:'6',priceKobo:'18500000',available:22},product:{id:'0613ec05-cd01-4088-aa2a-ac8d277ffec9',name:'Test Product',slug:'test-product',category:'CLOTHING',images:[]}};
 const cart={id:'cart-1',owner:'guest',expiresAt:null,data:[line],meta:{lineCount:1,itemCount:1,lineLimit:20,quantityLimit:99},currency:'NGN',subtotalKobo:'18500000',subtotalComplete:true,hasIssues:false};
 let added=false;
 await page.route('**/api-proxy/api/v1/store/cart**',async route=>{const m=route.request().method();
   if(m==='POST'||m==='PUT'||m==='PATCH'){added=true;return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(cart)});}
   if(m==='GET'&&added)return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(cart)});
   return route.continue();});
};
