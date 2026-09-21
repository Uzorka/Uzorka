import { chromium } from 'playwright';

// Use a preinstalled Chromium when one is pointed at, otherwise let
// Playwright resolve its own download.
const LAUNCH = process.env.CHROMIUM_PATH
  ? { executablePath: process.env.CHROMIUM_PATH }
  : {};
const OUT = process.env.OUT || '.review';
const BASE = 'http://localhost:4173';
const W = Number(process.env.W || 1440), H = Number(process.env.H || 900);
const TAG = process.env.TAG || String(W);
const browser = await chromium.launch(LAUNCH);
const ctx = await browser.newContext({
  viewport: { width: W, height: H },
  isMobile: W < 768, hasTouch: W < 768,
});
const page = await ctx.newPage();
const errs = [];
page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
const shot = async (n, full) => {
  const ov = await page.evaluate(() => ({ s: document.documentElement.scrollWidth, c: document.documentElement.clientWidth }));
  const bad = ov.s > ov.c + 1 ? `  << HORIZONTAL OVERFLOW ${ov.s}/${ov.c}` : '';
  await page.screenshot({ path: `${OUT}/${n}-${TAG}.png`, fullPage: !!full });
  console.log('  shot', n, bad);
};
const wait = (ms) => page.waitForTimeout(ms);
// A full-page screenshot temporarily resizes the viewport, so settle the
// layout afterwards; and clear any toast so it never masks the next click.
const settle = async () => {
  await page.evaluate(() => document.querySelectorAll('.toast [aria-label="Dismiss"]').forEach(b => b.click()));
  await page.waitForTimeout(350);
};

await page.goto(BASE + '/#/shop', { waitUntil: 'load' });
await wait(700);

// --- search overlay -------------------------------------------------------
await page.locator(W >= 768 ? '.navsearch' : '[aria-label="Search seafood"]').first().click();
await wait(400);
await shot('flow-search-idle');
await page.locator('.searchov__input').fill('praw');
await wait(450);
await shot('flow-search-typing');
await page.keyboard.press('Escape');
await wait(400);

// --- quick add that requires a decision -> customise sheet ----------------
await page.locator('.pcard').filter({ hasText: 'Tiger Prawns' }).first().hover();
await wait(250);
await page.locator('.pcard').filter({ hasText: 'Tiger Prawns' }).first().locator('.qadd').click();
await wait(600);
await shot('flow-customize');
// choose prep + an extra, then add
await page.locator('.ptile').filter({ hasText: 'Peeled & deveined' }).click();
await wait(400);
await shot('flow-customize-chosen');
await page.locator('.cust__foot .btn--primary').click();
await wait(1400);
await shot('flow-added');
await page.keyboard.press('Escape');
await wait(500);

// --- add a no-decision item (quick add path) ------------------------------
await page.goto(BASE + '/#/shop?c=smoked-dried', { waitUntil: 'load' });
await wait(600);
const qa = page.locator('.pcard').filter({ hasText: 'Dried Crayfish' }).first();
await qa.hover(); await wait(200);
await qa.locator('.qadd').click();
await wait(900);

// --- cart ------------------------------------------------------------------
if (W >= 768) {
  await page.locator('.navbtn--cart').click();
  await wait(700);
  await shot('flow-cart');
  await page.keyboard.press('Escape');
  await wait(500);
} else {
  await page.goto(BASE + '/#/cart', { waitUntil: 'load' });
  await wait(700);
  await shot('flow-cart', true);
await settle();
}

// --- checkout --------------------------------------------------------------
await page.goto(BASE + '/#/checkout', { waitUntil: 'load' });
await wait(700);
await shot('flow-co-1', true);
await settle();
await page.getByLabel('Full name').fill('Amaka Okafor');
await page.getByLabel('Mobile number').fill('08034112290');
await page.getByLabel('Email').fill('amaka@example.com');
await page.locator('.field__input').first().blur().catch(()=>{});
await page.keyboard.press('Tab');
await wait(400);
// validation demo: bad email
await page.getByLabel('Email').fill('amaka@nope');
await page.keyboard.press('Tab');
await wait(400);
await shot('flow-co-validation', true);
await settle();
await page.getByLabel('Email').fill('amaka@example.com');
await page.keyboard.press('Tab');
await wait(300);
await page.locator('.btn--primary').filter({ hasText: 'Continue to Delivery' }).first().click();
await wait(600);
// unserved zone
await page.locator('.zone').filter({ hasText: 'Ikorodu' }).click();
await wait(500);
await shot('flow-co-zoneblocked', true);
await settle();
await page.locator('.zone').filter({ hasText: 'Lekki Phase 1' }).click();
await wait(400);
await page.getByLabel('Street address').fill('14 Fola Osibo Street');
await page.keyboard.press('Tab');
await wait(400);
await shot('flow-co-2', true);
await settle();
await page.locator('.btn--primary').filter({ hasText: 'Continue to Schedule' }).first().click();
await wait(600);
await shot('flow-co-3', true);
await settle();
// blocked date explanation
const off = page.locator('.dtile.is-off').first();
if (await off.count()) { await off.click(); await wait(500); await shot('flow-co-dateblocked', true);
  await settle(); }
await wait(900); // the rail auto-scrolls the selection into view; let it settle
await page.locator('.dtile:not(.is-off)').first().scrollIntoViewIfNeeded();
await wait(400);
await page.locator('.dtile:not(.is-off)').first().click();
await wait(600);
await page.locator('.wtile:not(:disabled)').first().click();
await wait(500);
// wait for the step's primary action to actually enable before pressing it
await page.locator('.stickybuy .btn--primary, .conav .btn--primary').first()
  .waitFor({ state: 'visible' });
await page.waitForFunction(() => {
  const b = document.querySelector('.stickybuy .btn--primary, .conav .btn--primary');
  return b && !b.disabled;
}, null, { timeout: 8000 });
try {
  await page.locator('.btn--primary').filter({ hasText: 'Continue to Payment' }).first().click({ timeout: 6000 });
} catch (e) {
  await page.screenshot({ path: `${OUT}/FAIL-continue-payment-${TAG}.png` });
  console.log('FAILURE STATE:', JSON.stringify(await page.evaluate(() => {
    const sb = document.querySelector('.stickybuy');
    const btn = document.querySelector('.stickybuy .btn--primary');
    const r = btn ? btn.getBoundingClientRect() : null;
    const hit = r ? document.elementFromPoint(r.left + r.width/2, r.top + r.height/2) : null;
    const note = document.querySelector('.colayout .note--info');
    const nr = note ? note.getBoundingClientRect() : null;
    return {
      hasSticky: !!sb, sbPos: sb && getComputedStyle(sb).position, sbZ: sb && getComputedStyle(sb).zIndex,
      btnRect: r && [r.left|0, r.top|0, r.width|0, r.height|0], btnDisabled: btn && btn.disabled,
      btnText: btn && btn.textContent.trim().slice(0, 40),
      hit: hit ? (hit.className||hit.tagName).toString().slice(0,50) : null,
      noteRect: nr && [nr.left|0, nr.top|0, nr.width|0, nr.height|0],
      scrollY: scrollY|0, vh: innerHeight, vw: innerWidth,
      docScrollW: document.documentElement.scrollWidth,
      bodyLocked: document.body.dataset.locked || null,
      overlays: document.querySelectorAll('.overlay, .searchov').length,
    };
  })));
  throw e;
}
await wait(600);
await page.getByLabel('Card number').fill('4000000000000000');
await page.getByLabel('Expiry').fill('1228');
await page.getByLabel('CVV').fill('123');
await page.keyboard.press('Tab');
await wait(400);
await shot('flow-co-4', true);
await settle();
await page.locator('.btn--primary').filter({ hasText: 'Continue to Review' }).first().click();
await wait(600);
await shot('flow-co-5', true);
await settle();
await page.locator('.btn--primary').filter({ hasText: 'Place order' }).first().click();
await wait(700);
await shot('flow-co-placing', true);
await settle();
await wait(1800);
await shot('flow-order-confirmed', true);
await settle();
await wait(20000);
await shot('flow-order-tracking', true);
await settle();

// --- orders list + admin with a real order --------------------------------
await page.goto(BASE + '/#/orders', { waitUntil: 'load' });
await wait(700);
await shot('flow-orders', true);
await settle();
await page.goto(BASE + '/#/admin', { waitUntil: 'load' });
await wait(700);
await shot('flow-admin', true);
await settle();

// --- box with contents -----------------------------------------------------
await page.goto(BASE + '/#/box', { waitUntil: 'load' });
await wait(600);
for (const n of ['Tiger Prawns', 'Fresh Croaker', 'Periwinkle', 'Smoked Catfish']) {
  const row = page.locator('.bitem').filter({ hasText: n }).first();
  await row.getByRole('button', { name: /^Add 500/ }).click();
  await wait(220);
  await row.getByRole('button', { name: /^Add 500/ }).click();
  await wait(220);
}
await wait(600);
await shot('flow-box-filled', true);
await settle();

console.log(errs.length ? 'ERRORS: ' + [...new Set(errs)].slice(0,6).join(' | ') : 'no console errors');
await browser.close();
