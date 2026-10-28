// BASE_URL=https://... PLAYWRIGHT_MODULE=/.../playwright/index.mjs node scripts/qa-ui.mjs
import assert from "node:assert/strict";
import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const base = process.env.BASE_URL;
assert(base, "BASE_URL is required");
await mkdir("/tmp/avinhoney-qa", { recursive: true });
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
async function visit(url) {
  const response = await page.goto(url,{waitUntil:"domcontentloaded",timeout:60000});
  await page.locator("main,.admin-login-card,.admin-shell").first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  return response;
}
try {
  for (const [width,height] of [[1440,900],[1280,720],[1024,768],[980,1600],[768,1024],[844,390],[390,844],[360,740],[320,690]]) {
    await page.setViewportSize({width,height});
    assert.equal((await visit(base)).status(),200);
    const metrics = await page.evaluate(() => {
      const hero=document.querySelector(".hero").getBoundingClientRect();
      const cta=document.querySelector(".hero-actions").getBoundingClientRect();
      return {viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,heroBottom:Math.round(hero.bottom),ctaBottom:Math.round(cta.bottom),bee:!!document.querySelector(".line-bee"),oldBees:document.querySelectorAll(".bee-1,.bee-2").length,leaves:document.querySelectorAll(".hero .leaf-layer i").length};
    });
    assert(metrics.scrollWidth<=width+1,`Horizontal overflow at ${width}: ${metrics.scrollWidth}`);
    assert.equal(metrics.oldBees,0); assert(metrics.bee && metrics.leaves===6);
    assert(metrics.ctaBottom<=metrics.heroBottom,"Clipped hero CTA");
    assert(metrics.heroBottom<=height+2,`Hero does not fit ${width}x${height}: ${metrics.heroBottom}`);
    console.log("VIEWPORT",`${width}x${height}`,JSON.stringify(metrics));
    if([1440,390,844].includes(width)) await page.screenshot({path:`/tmp/avinhoney-qa/hero-${width}.png`});
  }
  await page.setViewportSize({width:1440,height:900}); await visit(base);
  assert.equal(await page.locator(".hex-gallery-item").count(),6,"honeycomb gallery has six cards");
  assert.equal(await page.locator(".hex-item-photo").count(),3,"three photographic cells");
  await page.locator(".hex-item-photo").first().click();
  await page.getByRole("dialog").waitFor();
  assert.equal(await page.locator(".hex-lightbox-image").count(),1,"photo cell shows only its own image");
  assert.equal(await page.locator(".hex-lightbox-image img").count(),1,"exactly one image inside the viewer");
  assert.equal(await page.locator(".hex-lightbox-nav").count(),0,"no cross-cell image cycling");
  await page.keyboard.press("Escape"); await page.waitForTimeout(180);
  assert.equal(await page.locator(".hex-lightbox").count(),0,"Escape closes the viewer");
  await page.locator(".hex-item-facts").click();
  await page.locator(".hex-fact-list").waitFor();
  assert.equal(await page.locator(".hex-fact-list li").count(),3,"facts cell has its own three facts");
  assert.equal(await page.locator(".hex-lightbox-image").count(),0,"facts cell shows no photo");
  await page.keyboard.press("Escape"); await page.waitForTimeout(180);
  await page.locator("#story-route").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.locator(".journey-rail-node-2").click();
  await page.waitForTimeout(450);
  assert((await page.locator(".journey-art-caption").textContent()).includes("اصفهان"),"rail click switches the active station");
  assert.equal(await page.locator(".journey-rail-node-2.node-on").count(),1,"the clicked station lights up");
  assert.equal(await page.locator(".journey-drop").count(),0,"no overlapping drop marker remains");
  console.log("HONEYCOMB independent cells and scroll story passed");
  await page.getByRole("button",{name:"سایهٔ جنگل",exact:true}).click();
  assert.equal(await page.locator(".orbit-caption b").textContent(),"سایهٔ جنگل");
  await page.locator("#featured").scrollIntoViewIfNeeded(); await page.mouse.move(0,0);
  const before=await page.locator(".featured-track").evaluate(el=>el.scrollLeft);
  await page.waitForTimeout(1100);
  const after=await page.locator(".featured-track").evaluate(el=>el.scrollLeft);
  assert(Math.abs(before-after)>3,"Showcase must move");
  assert.equal(await page.locator(".showcase-controls").count(),0,"No playback buttons should be visible");
  const rail=await page.locator(".featured-track").boundingBox();
  await page.mouse.move(rail.x+rail.width/2,rail.y+100);
  const manualBefore=await page.locator(".featured-track").evaluate(el=>el.scrollLeft);
  await page.mouse.wheel(-170,0); await page.waitForTimeout(350);
  const stopped=await page.locator(".featured-track").evaluate(el=>el.scrollLeft);
  assert(Math.abs(stopped-manualBefore)>40,"Wheel should move the rail freely");
  await page.waitForTimeout(350);
  assert(Math.abs(stopped-await page.locator(".featured-track").evaluate(el=>el.scrollLeft))<=1,"Autoplay must not fight the user");
  await page.mouse.move(0,0); await page.waitForTimeout(2300);
  assert(Math.abs(stopped-await page.locator(".featured-track").evaluate(el=>el.scrollLeft))>2,"Autoplay should resume smoothly");
  console.log("CAROUSEL autoplay / manual control / resume passed");
  await page.locator("#taste-guide").scrollIntoViewIfNeeded();
  await page.getByRole("button",{name:/شکوفه و گل/}).click();
  await page.getByRole("button",{name:"پرسش بعدی",exact:true}).click();
  await page.getByRole("button",{name:/آرام و لطیف/}).click();
  await page.getByRole("button",{name:"پرسش بعدی",exact:true}).click();
  await page.getByRole("button",{name:/صبحانهٔ آرام/}).click();
  await page.getByRole("button",{name:"طعم من را پیدا کن",exact:true}).click();
  assert((await page.locator(".taste-match").textContent()).includes("تک‌گل"));
  console.log("QUIZ three steps and result passed");
  await page.locator(".cart-trigger").click(); assert(await page.getByRole("dialog").isVisible());
  await page.keyboard.press("Escape"); await page.waitForTimeout(350);
  assert.equal(await page.locator(".drawer-layer-open").count(),0);
  console.log("CART keyboard interaction passed");
  for(const route of ["/about","/discover","/journal","/journal/why-honey-crystallizes","/journal/how-to-store-honey","/journal/a-guide-to-honey-flavors"]) {
    assert.equal((await visit(base+route)).status(),200);
    assert.equal(await page.locator("h1").count(),1);
    assert((await page.locator('link[rel="canonical"]').getAttribute("href")).endsWith(route));
  }
  const sitemap=await (await context.request.get(base+"/sitemap.xml")).text();
  assert(sitemap.includes("/discover") && sitemap.includes("/journal/why-honey-crystallizes") && !sitemap.includes("/admin"));
  assert.equal((await context.request.get(base+"/api/admin/catalog")).status(),401);
  assert((await context.request.post(base+"/api/admin/login",{data:null})).status()>=400);
  console.log("PAGES, canonical, sitemap and protected API passed");
  const username=process.env.ADMIN_USERNAME; const password=process.env.ADMIN_PASSWORD;
  if(username && password && password.trim().length>=12) {
    await visit(base+"/admin");
    await page.locator('input[name="username"]').fill(username.trim());
    await page.locator('input[name="password"]').fill(password.trim());
    await page.getByRole("button",{name:"ورود به پنل",exact:true}).click();
    await page.waitForSelector(".admin-shell",{timeout:20000});
    console.log("ADMIN actual browser login passed");
    let productId; let imagePath; const name=`QA-AVIN-${Date.now()}`;
    try {
      await page.locator(".admin-tabs button").nth(2).click();
      await page.locator('input[name="name"]').fill(name);
      await page.locator('input[name="isFeatured"]').check();
      const uploadResponse=page.waitForResponse(r=>r.url().endsWith("/api/admin/upload") && r.request().method()==="POST");
      await page.locator('input[type="file"]').setInputFiles(path.resolve("public/images/hero-honey.jpg"));
      const uploaded=await uploadResponse; assert.equal(uploaded.status(),201);
      imagePath=(await uploaded.json()).path;
      assert.equal((await context.request.get(base+imagePath)).status(),200,"Runtime upload must be served without rebuild");
      await page.getByPlaceholder("مثلاً ۵۰۰ گرم").fill("۵۰۰ گرم");
      await page.getByPlaceholder("450000",{exact:true}).fill("۴۵۰۰۰۰");
      await page.getByPlaceholder("20",{exact:true}).fill("۳");
      const createdResponse=page.waitForResponse(r=>r.url().endsWith("/api/admin/products") && r.request().method()==="POST");
      await page.getByRole("button",{name:"ثبت محصول در سایت",exact:true}).click();
      const created=await createdResponse; assert.equal(created.status(),201); productId=(await created.json()).product.id;
      await visit(base);
      assert.equal(await page.locator(".product-info h3").filter({hasText:name}).count(),1);
      assert.equal(await page.locator(".glass-info h3").filter({hasText:name}).count(),1);
      await page.locator(".product-card img").first().scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>{const image=document.querySelector(".product-card img");return image && image.complete && image.naturalWidth>0;},{timeout:30000});
      assert((await page.locator(".current-price").first().textContent()).includes("۴۵۰"));
      console.log("ADMIN upload, Persian digits, featured product and live image passed");
    } finally {
      if(productId) assert.equal((await context.request.delete(base+`/api/admin/products?id=${productId}`)).status(),200);
      if(imagePath && /^\/uploads\/product-\d{13}-[a-f0-9]{8}\.(jpg|png|webp)$/.test(imagePath)) await unlink(path.join(process.cwd(),"public",imagePath)).catch(()=>{});
    }
    await context.request.post(base+"/api/admin/logout");
    assert.equal((await context.request.get(base+"/api/admin/session")).status(),401);
  } else console.log("ADMIN skipped: no configured test credentials in this process");
  await context.close();
  const reduced=await browser.newContext({viewport:{width:390,height:844},reducedMotion:"reduce"});
  const reducedPage=await reduced.newPage();
  await reducedPage.goto(base,{waitUntil:"domcontentloaded"});
  await reducedPage.locator(".hero .leaf-layer").waitFor({state:"attached"});
  assert.equal(await reducedPage.locator(".hero .leaf-layer").evaluate(el=>getComputedStyle(el).display),"none");
  assert.equal(await reducedPage.locator(".line-bee-wing").first().evaluate(el=>getComputedStyle(el).animationName),"none");
  await reduced.close(); assert.deepEqual(errors,[],"Unexpected browser error");
  console.log("PASS: responsive layouts, line bee, leaves, carousel, quiz, cart, pages, SEO, admin, uploads and reduced motion");
} catch(error) {
  if(!page.isClosed()) await page.screenshot({path:"/tmp/avinhoney-qa/failure.png"}).catch(()=>{});
  throw error;
} finally { await browser.close(); }
