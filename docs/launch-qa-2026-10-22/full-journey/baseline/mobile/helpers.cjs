const {shot}=require('./lib.cjs');
// emulate on-screen keyboard (~290px on a 812px phone) by shrinking the layout viewport
async function withKeyboard(page,loc,text,name,{type=true}={}){
  await loc.scrollIntoViewIfNeeded();
  await loc.tap();
  await page.setViewportSize({width:375,height:812-300});
  await page.waitForTimeout(500);
  await loc.evaluate(e=>e.scrollIntoView({block:'center'})); // Chrome Android scrolls focused input into view
  await page.waitForTimeout(500);
  const info=await loc.evaluate(e=>{const r=e.getBoundingClientRect();const cx=r.left+r.width/2,cy=r.top+r.height/2;const top=document.elementFromPoint(cx,cy);return {top:Math.round(r.top),bottom:Math.round(r.bottom),vh:innerHeight,covered:top!==e&&!e.contains(top)&&!(top&&top.closest('label')&&top.closest('label').contains(e)),coveredBy:top&&top!==e?(top.tagName+'.'+String(top.className).slice(0,40)):null,fixed:[...document.querySelectorAll('*')].filter(x=>{const p=getComputedStyle(x).position;if(p!=='fixed'&&p!=='sticky')return false;const q=x.getBoundingClientRect();return q.width>100&&q.height>10&&q.bottom>0&&q.top<innerHeight}).map(x=>x.tagName+'.'+String(x.className).slice(0,30)+' '+Math.round(x.getBoundingClientRect().top)+'-'+Math.round(x.getBoundingClientRect().bottom)).slice(0,5)}});
  if(type&&text!=null){await page.keyboard.type(text,{delay:30});}
  await shot(page,name);
  await page.setViewportSize({width:375,height:812});
  await page.waitForTimeout(300);
  return info;
}
module.exports={withKeyboard};
