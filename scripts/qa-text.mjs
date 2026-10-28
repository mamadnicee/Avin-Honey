// BASE_URL=https://... PLAYWRIGHT_MODULE=/.../playwright/index.mjs node scripts/qa-text.mjs
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const base = process.env.BASE_URL;
assert(base, "BASE_URL is required");
await mkdir("/tmp/avinhoney-text", { recursive: true });
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
async function visit(url) {
  const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.locator("main").first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 25)); } scrollTo(0, 0); });
  await page.waitForTimeout(200);
  return response;
}
const SIZES = [[1440, 900], [1280, 720], [1024, 768], [768, 1024], [844, 390], [390, 844], [360, 740], [320, 690]];
const PAGES = ["/", "/about", "/journal", "/journal/why-honey-crystallizes", "/journal/how-to-store-honey", "/journal/a-guide-to-honey-flavors", "/discover"];
// Minimum readable size for explanatory text, per selector (CSS px, at the narrowest phone size).
const MIN_FONT = { ".hero-description": 12, ".section-description": 13.5, ".story-body": 13.5, ".origin-card > p": 13.5, ".journey-step p": 13.5, ".faq-item p": 13.5, ".charter-card p": 13, ".science-fact span": 13.5, ".journal-card-copy p": 13, ".article-body p": 15, ".footer-nav a": 13 };

for (const [width, height] of SIZES) {
  await page.setViewportSize({ width, height });
  for (const route of PAGES) {
    assert.equal((await visit(base + route)).status(), 200, route);
    const report = await page.evaluate((minFont) => {
      const out = { overflow: [], clipped: [], fonts: [], justify: [], doc: document.documentElement.scrollWidth - innerWidth };
      const skip = ".featured-track,.cart-drawer,.drawer-layer,.leaf-layer,.hero-comb,.hero-halo,.botanical-branch,.featured-glow,.main-nav,.skip-link,.back-top,.toast,.admin-toast,.ticker-track,.accessible-motion-control,.inquiry-honeypot";
      for (const el of document.querySelectorAll("main *, footer *")) {
        if (el.closest(skip)) continue;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height || getComputedStyle(el).visibility === "hidden") continue;
        if (r.right > innerWidth + 1 || r.left < -1) out.overflow.push(`${el.tagName}.${String(el.className).slice(0, 30)} ${Math.round(r.left)}..${Math.round(r.right)}`);
        const cs = getComputedStyle(el);
        if ((cs.overflowX === "hidden" || cs.overflow === "hidden") && el.scrollWidth > el.clientWidth + 2 && el.children.length === 0) out.clipped.push(`${el.tagName}.${String(el.className).slice(0, 30)}`);
      }
      for (const [selector, min] of Object.entries(minFont)) {
        const el = document.querySelector(selector); if (!el) continue;
        const size = parseFloat(getComputedStyle(el).fontSize);
        if (size < min) out.fonts.push(`${selector}=${size}`);
      }
      // Justified paragraphs must share the same start and end edge on every full line.
      for (const p of document.querySelectorAll(".article-body p")) {
        const cs = getComputedStyle(p); if (cs.textAlign !== "justify") { out.justify.push("not justified"); continue; }
        const box = p.getBoundingClientRect(); const range = document.createRange(); range.selectNodeContents(p);
        const lines = new Map();
        for (const rect of range.getClientRects()) { if (!rect.width) continue; const key = Math.round(rect.top / 6); const cur = lines.get(key) || { l: 1e9, r: -1e9 }; cur.l = Math.min(cur.l, rect.left); cur.r = Math.max(cur.r, rect.right); lines.set(key, cur); }
        const rows = [...lines.values()];
        rows.slice(0, -1).forEach((line, i) => { if (Math.abs(line.r - box.right) > 3 || Math.abs(line.l - box.left) > 3) out.justify.push(`line ${i + 1} edges ${Math.round(line.l - box.left)}/${Math.round(line.r - box.right)}`); });
      }
      return out;
    }, MIN_FONT);
    const label = `${width}x${height} ${route}`;
    assert(report.doc <= 1, `${label}: horizontal overflow ${report.doc}px`);
    assert.deepEqual(report.overflow, [], `${label}: elements outside viewport`);
    assert.deepEqual(report.clipped, [], `${label}: clipped text`);
    if (width <= 390) assert.deepEqual(report.fonts, [], `${label}: font below readable minimum`);
    assert.deepEqual(report.justify, [], `${label}: article paragraph edges`);
  }
  console.log("PASS", `${width}x${height}`, PAGES.length, "pages");
}

// Content requirements.
await page.setViewportSize({ width: 1440, height: 900 });
await visit(base);
const html = await page.content();
assert.equal(await page.locator(".origin-image span").count(), 0, "image labels must be gone");
assert(!/FLOWER|\bNATURE\b|\bHIVE\b/.test(await page.locator(".origins-section").innerText()), "English tags removed");
assert(!html.includes("از کجا شروع کنیم"), "removed hero label");
assert(!html.includes("ارتباط مستقیم با زنبورستان"), "contact strip removed");
assert(await page.locator(".science-fact").count() === 3, "science facts present");
assert(!html.includes("AVIN-ZAGROS-PERMIT"), "no invented permit code");
const footer = await page.locator("footer").innerText();
for (const needle of ["+98 991 380 5102", "avin__honey", "فلاطوری"]) assert(footer.includes(needle), `footer has ${needle}`);
const journal = await (async () => { await visit(base + "/journal"); return page.locator(".journal-image img").evaluateAll((els) => els.map((e) => new URL(e.currentSrc || e.src).searchParams.get("url") || e.src)); })();
assert.equal(new Set(journal).size, journal.length, "journal images are distinct");
await visit(base);
const home = await page.locator(".origin-image img, .journal-image img").evaluateAll((els) => els.map((e) => new URL(e.currentSrc || e.src).searchParams.get("url") || e.src));
assert.equal(new Set(home).size, home.length, "home origin and journal images do not repeat");
await visit(base);
assert.equal(await page.locator(".hex-gallery-item").count(), 6, "six honeycomb gallery cells are present");
assert.equal(await page.locator(".brand-copy .avin-wordmark img").count(), 1, "A logo appears alongside the existing drop mark");
assert.equal(await page.locator(".brand-mark").count() > 0, true, "existing drop-in-hex icon stays in place");
assert.equal(await page.locator(".journey-card-slide").count(), 4, "scroll story contains four chapters");
await page.getByRole("link", { name: "دربارهٔ ما", exact: true }).first().click();
await page.waitForURL("**/about", { timeout: 15000 });
assert.equal(new URL(page.url()).pathname, "/about");
await page.locator(".about-pillar").first().waitFor();
assert.equal(await page.locator(".about-pillar").count(), 3);
assert((await page.locator(".permit-detail-row").innerText()).includes("۱۹۲۴۱۰۷۳۱۷"), "supplied permit number is displayed");
const headingText = await page.locator(".permit-card-heading").innerText();
assert(headingText.includes("شناسنامه") && headingText.includes("زنبورداری"), "permit section uses the official title");
if (!process.env.BEEKEEPING_MOJAVEZ_URL && !process.env.BEEKEEPING_SEMAK_URL) assert.equal(await page.locator(".official-qr-image img").count(), 0, "no guessed verification QR is shown");
assert((await page.locator("footer .avin-wordmark img").getAttribute("src") || "").includes("white"), "footer uses the white logo variant");
console.log("CONTENT checks passed");

for (const [name, w, h, route, selector] of [["article-mobile", 390, 844, "/journal/how-to-store-honey", ".article-body"], ["home-charter-mobile", 390, 844, "/", ".apiary-charter-section"], ["home-charter-desktop", 1440, 900, "/", ".apiary-charter-section"], ["article-landscape", 844, 390, "/journal/why-honey-crystallizes", ".article-body"]]) {
  await page.setViewportSize({ width: w, height: h }); await visit(base + route);
  await page.locator(selector).scrollIntoViewIfNeeded(); await page.waitForTimeout(250);
  await page.screenshot({ path: `/tmp/avinhoney-text/${name}.png` });
}
assert.deepEqual(errors, []);
await browser.close();
console.log("PASS: readable text, justified articles, labels removed, science strip, footer contacts, responsive layouts");
