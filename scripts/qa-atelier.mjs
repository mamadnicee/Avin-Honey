// BASE_URL=https://... PLAYWRIGHT_MODULE=/.../playwright/index.mjs node scripts/qa-atelier.mjs
import assert from "node:assert/strict";
import { mkdir, unlink } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";
createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const base=process.env.BASE_URL;
const username=process.env.ADMIN_USERNAME?.trim(); const password=process.env.ADMIN_PASSWORD?.trim();
assert(base && username && password,"Configured preview and admin credentials required");
await mkdir("/tmp/avinhoney-atelier",{recursive:true});
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const ctx=await browser.newContext({viewport:{width:1440,height:900}});
const page=await ctx.newPage();const errors=[];page.on("pageerror",e=>errors.push(e.message));
const ids=[];let imagePath="";let giftReference="";const tag=`QA-ATELIER-${Date.now()}`;
async function visit(url) {const r=await page.goto(url,{waitUntil:"domcontentloaded",timeout:60000});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(200);return r;}
async function loginRequest(request) {const r=await request.post(base+"/api/admin/login",{headers:{Origin:base},data:{username,password}});assert.equal(r.status(),200);}

try {
  await visit(base);
  const a=await page.locator(".line-bee").evaluate(el=>getComputedStyle(el).transform);
  await page.waitForTimeout(400);
  const b=await page.locator(".line-bee").evaluate(el=>getComputedStyle(el).transform);
  assert.notEqual(a,b,"The bee should gently move in place");
  assert.notEqual(await page.locator(".bee-wing-motion").first().evaluate(el=>getComputedStyle(el).animationName),"none");
  assert((await page.locator(".footer-drip").evaluate(el=>el.getBoundingClientRect().height))>=36);
  assert.equal(await page.locator(".showcase-controls").count(),0);
  console.log("BEE motion, thicker footer and no playback controls passed");

  await page.locator("#gifts").scrollIntoViewIfNeeded();
  await page.locator(".gift-branch[data-bloom=ready]").waitFor();
  await page.getByRole("button",{name:"برای یک تیم",exact:true}).click();
  await page.locator(".gift-panel").screenshot({path:"/tmp/avinhoney-atelier/gift.png"});
  await page.getByRole("button",{name:"گفت‌وگو دربارهٔ یک هدیهٔ شیرین",exact:true}).click();
  const form=page.locator(".gift-form");
  await form.locator('[name="customerName"]').fill(tag);
  await form.locator('[name="phone"]').fill("۰۹۱۲۰۰۰۰۰۰۰");
  await form.locator('[name="quantity"]').fill("۲۴");
  await form.locator('[name="note"]').fill("آزمون هماهنگی هدیه؛ دادهٔ موقت QA");
  await form.locator('[name="consent"]').check();
  const giftResponse=page.waitForResponse(r=>r.url().endsWith("/api/inquiries") && r.request().method()==="POST");
  await form.getByRole("button",{name:/ارسال درخواست|ثبت درخواست/}).click();
  const gift=await giftResponse;assert.equal(gift.status(),201);giftReference=(await gift.json()).reference;
  await page.locator(".gift-success").waitFor();
  assert((await page.locator(".gift-success").textContent()).includes(giftReference));

  await visit(base+"/admin");await page.locator('[name="username"]').fill(username);await page.locator('[name="password"]').fill(password);
  await page.getByRole("button",{name:"ورود به پنل",exact:true}).click();await page.locator(".admin-shell").waitFor({timeout:20000});
  await page.getByRole("button",{name:"هدیه و همکاری",exact:true}).click();
  const inquiry=page.locator(".admin-inquiry-card").filter({hasText:tag});await inquiry.waitFor();
  assert((await inquiry.textContent()).includes("۲۴"));
  await inquiry.getByRole("button",{name:"پیگیری انجام شد",exact:true}).click();
  await inquiry.locator(".status-contacted").waitFor();
  console.log("GIFT form, Persian digits, DB persistence and admin follow-up passed");

  await page.getByRole("button",{name:"+ افزودن محصول",exact:true}).click();
  const uploadResponse=page.waitForResponse(r=>r.url().endsWith("/api/admin/upload") && r.request().method()==="POST");
  await page.locator('input[type="file"]').setInputFiles(path.resolve("public/images/hero-honey.jpg"));
  const upload=await uploadResponse;assert.equal(upload.status(),201);imagePath=(await upload.json()).path;
  for(let i=0;i<20;i++) {
    const r=await ctx.request.post(base+"/api/admin/products",{headers:{Origin:base},data:{name:`${tag}-${String(i+1).padStart(2,"0")}`,category:"تک‌گل",subtitle:"",description:"محصول موقت آزمون",origin:"اصفهان",harvestSeason:"",badge:"",image:imagePath,isFeatured:true,variants:[{weight:"۵۰۰ گرم",price:450000+i*1000,stock:3}]}});
    assert.equal(r.status(),201);ids.push((await r.json()).product.id);
  }
  await visit(base);
  assert.equal(await page.locator(".product-info h3").filter({hasText:tag}).count(),20);
  assert.equal(await page.locator(".glass-info h3").filter({hasText:tag}).count(),20);
  console.log("CATALOG: all 20 products and all 20 featured entries rendered");
  await visit(base+"/admin");await page.getByRole("button",{name:/^محصولات \(/}).click();
  const group=page.locator(".admin-product-group").filter({hasText:`${tag}-01`});await group.waitFor();
  const flagResponse=page.waitForResponse(r=>r.url().endsWith("/api/admin/catalog") && r.request().method()==="PATCH");
  await group.locator('.admin-featured-toggle input').uncheck();assert.equal((await flagResponse).status(),200);
  await visit(base);
  assert.equal(await page.locator(".glass-info h3").filter({hasText:tag}).count(),19);
  assert.equal(await page.locator(".product-info h3").filter({hasText:tag}).count(),20);
  assert.equal((await ctx.request.patch(base+"/api/admin/catalog",{headers:{Origin:"https://untrusted.example"},data:{productId:ids[0],isFeatured:true}})).status(),401);
  console.log("FEATURED toggle and cross-origin write rejection passed");

  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const touchPage=await mobile.newPage();touchPage.on("pageerror",e=>errors.push(e.message));
  await touchPage.goto(base,{waitUntil:"domcontentloaded"});await touchPage.evaluate(()=>document.fonts.ready);await touchPage.waitForTimeout(300);
  const rail=touchPage.locator(".featured-track");await rail.scrollIntoViewIfNeeded();
  const rect=await rail.boundingBox();const y=rect.y+Math.min(120,rect.height/3);const cdp=await mobile.newCDPSession(touchPage);
  async function swipe(from,to) {
    const start=await rail.evaluate(el=>el.scrollLeft);const samples=[start];
    await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:from,y,radiusX:6,radiusY:6,force:1}]});
    for(let step=1;step<=12;step++) {await cdp.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:from+(to-from)*step/12,y,radiusX:6,radiusY:6,force:1}]});await touchPage.waitForTimeout(22);samples.push(await rail.evaluate(el=>el.scrollLeft));}
    await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
    for(let i=0;i<8;i++) {await touchPage.waitForTimeout(65);samples.push(await rail.evaluate(el=>el.scrollLeft));}
    const sign=to>from?-1:1;
    assert(Math.abs(samples.at(-1)-start)>60,"Touch swipe must move the rail");
    for(let i=1;i<samples.length;i++) assert((samples[i]-samples[i-1])*sign>=-4,`Autoplay fought touch momentum: ${JSON.stringify(samples)}`);
    return samples.at(-1);
  }
  await swipe(80,295);await touchPage.waitForTimeout(150);await swipe(295,80);
  await touchPage.waitForTimeout(2450);
  const resumed=await rail.evaluate(el=>el.scrollLeft);await touchPage.waitForTimeout(300);
  const resumedAfter=await rail.evaluate(el=>el.scrollLeft);
  assert(Math.abs(resumed-resumedAfter)>2,"Autoplay should resume after touch momentum ends");
  const scrollWidth=await touchPage.evaluate(()=>document.documentElement.scrollWidth);assert(scrollWidth<=390);
  console.log("TOUCH: native swipes both directions, momentum ownership and smooth resume passed");
  await mobile.close();

  const embedded=await browser.newContext({viewport:{width:500,height:1000}});const host=await embedded.newPage();host.on("pageerror",e=>errors.push(e.message));
  const embeddedCDP=await embedded.newCDPSession(host);await embeddedCDP.send("Network.enable");await embeddedCDP.send("Network.setCookieControls",{enableThirdPartyCookieRestriction:true,disableThirdPartyCookieMetadata:true,disableThirdPartyCookieHeuristics:true});
  await host.route("https://preview-host.test/**",r=>r.fulfill({contentType:"text/html",body:`<html><body style="margin:0"><iframe title="shop" src="${base}/admin" style="width:100%;height:1000px;border:0"></iframe></body></html>`}));
  await host.goto("https://preview-host.test",{waitUntil:"domcontentloaded"});const frame=host.frameLocator("iframe");
  await frame.locator(".admin-context-note").waitFor();
  await frame.locator('[name="username"]').fill(username);await frame.locator('[name="password"]').fill(password);
  const embeddedLogin=host.waitForResponse(r=>r.url().endsWith("/api/admin/login") && r.request().method()==="POST");
  await frame.getByRole("button",{name:"ورود به پنل",exact:true}).click();
  const response=await embeddedLogin;assert.equal(response.status(),200);assert.equal((await response.json()).sessionMode,"partitioned");
  await frame.locator(".admin-shell").waitFor({timeout:20000});
  const cookie=(await embedded.cookies()).find(c=>c.name==="__Host-avinhoney_admin_embed");
  assert(cookie && cookie.httpOnly && cookie.secure && cookie.sameSite==="None");
  await frame.getByRole("button",{name:"خروج",exact:true}).click();await frame.locator('[name="username"]').waitFor({timeout:15000});
  console.log("EMBEDDED ADMIN: login/logout with third-party cookie restriction and secure CHIPS passed");
  await embedded.close();
  assert.deepEqual(errors,[],"Unexpected browser exception");
  console.log("PASS: motion, flowers, footer, gift workflow, 20 products, touch scrolling and embedded admin");
} catch(error) {
  await page.screenshot({path:"/tmp/avinhoney-atelier/failure.png"}).catch(()=>{});throw error;
} finally {
  try {
    await loginRequest(ctx.request);
    for(const id of ids) await ctx.request.delete(base+`/api/admin/products?id=${id}`,{headers:{Origin:base}});
    if(giftReference) {
      const r=await ctx.request.get(base+"/api/admin/inquiries");
      if(r.ok()) {const record=(await r.json()).inquiries.find(i=>i.reference===giftReference);if(record) await ctx.request.delete(base+`/api/admin/inquiries?id=${record.id}`,{headers:{Origin:base}});}
    }
    if(imagePath && /^\/uploads\/product-\d{13}-[a-f0-9]{8}\.(jpg|png|webp)$/.test(imagePath)) await unlink(path.join(process.cwd(),"public",imagePath)).catch(()=>{});
    console.log("Temporary QA products, inquiry and upload cleaned up");
  } finally {await browser.close();}
}
