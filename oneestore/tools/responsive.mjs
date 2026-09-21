import { chromium } from 'playwright';

// Use a preinstalled Chromium when one is pointed at, otherwise let
// Playwright resolve its own download.
const LAUNCH = process.env.CHROMIUM_PATH
  ? { executablePath: process.env.CHROMIUM_PATH }
  : {};
import { mkdir } from 'node:fs/promises';
const OUT = process.env.OUT || '.review';
const BASE = 'http://localhost:4173';

const WIDTHS = [
  [375, 812, 'mobile 375'],
  [430, 932, 'mobile 430'],
  [768, 1024, 'tablet 768'],
  [1024, 800, 'laptop 1024'],
  [1440, 900, 'desktop 1440'],
];
const ROUTES = [
  ['home', '/'],
  ['shop', '/shop'],
  ['pdp', '/p/fresh-croaker'],
  ['box', '/box'],
  ['meals', '/meals'],
  ['mealb', '/meals/seafood-okra'],
  ['promise', '/promise'],
  ['orders', '/orders'],
  ['saved', '/saved'],
  ['account', '/account'],
  ['cart', '/cart'],
  ['checkout', '/checkout'],
  ['admin', '/admin'],
];

const browser = await chromium.launch(LAUNCH);
let problems = 0;

for (const [w, h, label] of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h }, isMobile: w < 768, hasTouch: w < 768,
  });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });

  // seed a basket + an order so populated states are exercised too
  await page.goto(BASE + '/#/', { waitUntil: 'load' });
  await page.evaluate(() => {
    const now = Date.now();
    localStorage.setItem('oneestore:state', JSON.stringify({
      cart: [
        { id: 'c1', productId: 'p-croaker', grams: 2000, prep: 'cleaned', extras: ['head-on','scaled'], qty: 1 },
        { id: 'c2', productId: 'p-tiger-prawns', grams: 1000, prep: 'peeled-deveined', extras: ['portion-bags'], qty: 2 },
      ],
      favourites: ['p-croaker', 'p-lobster', 'p-oysters'],
      orders: [{
        no: 'OS-T3M8P', placedAt: now - 300000,
        lines: [{ id: 'o1', productId: 'p-snapper', grams: 1200, prep: 'butterflied', extras: ['scaled'], qty: 1 }],
        subtotal: 14600, deliveryFee: 2500, total: 17100, zoneId: 'z-lekki1',
        address: '14 Fola Osibo Street', contact: { name: 'Amaka Okafor', phone: '0803 411 2290', email: 'amaka@example.com' },
        slotDate: new Date(now + 86400000).toISOString().slice(0,10), slotWindow: '9:00 – 12:00',
        payment: 'Card', stage: 3, stamps: { confirmed: now - 300000, sourcing: now - 240000, checked: now - 150000, preparing: now - 60000 },
      }],
      box: { 'p-tiger-prawns': 1000, 'p-periwinkle': 500 }, boxSize: 'medium',
      prefs: { preps: { 'p-croaker': 'cleaned' }, contact: { name: 'Amaka Okafor', phone: '0803 411 2290', email: 'amaka@example.com' },
               address: { line: '14 Fola Osibo Street', zoneId: 'z-lekki1', instructions: 'Blue gate' },
               theme: 'system', recentSearches: ['prawns', 'croaker'], returning: true },
    }));
  });

  const rows = [];
  for (const [name, route] of ROUTES) {
    await page.goto(BASE + '/#' + route, { waitUntil: 'load' });
    await page.waitForTimeout(550);
    await page.evaluate(async () => {
      const html = document.documentElement;
      html.style.scrollBehavior = 'auto';
      const step = innerHeight * 0.8;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 70));
      }
      scrollTo({ top: 0, behavior: 'instant' });
    });
    await page.waitForTimeout(350);

    const audit = await page.evaluate(() => {
      const de = document.documentElement;
      const clipped = (el) => {
        for (let n = el.parentElement; n; n = n.parentElement) {
          const ov = getComputedStyle(n).overflowX;
          if (ov === 'hidden' || ov === 'auto' || ov === 'scroll' || ov === 'clip') return true;
        }
        return false;
      };
      const over = [];
      const small = [];
      document.querySelectorAll('*').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && (r.right > de.clientWidth + 1.5 || r.left < -1.5) && !clipped(el)) {
          over.push((el.className || el.tagName).toString().split(' ')[0]);
        }
      });
      // touch targets: interactive elements smaller than 44px in either axis
      document.querySelectorAll('button,a[href],input,select,textarea,[role="radio"],[role="switch"],[role="tab"]').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none') return;
        // A visually hidden input inside a wrapping <label> is not the target;
        // the label is. Skip those rather than reporting a phantom 1x1.
        if (el.closest('label') && r.width <= 2 && r.height <= 2) return;
        // A control may keep a small visual track but extend its hit area with
        // an absolutely positioned pseudo-element pulled outside its box.
        const grow = (pseudo) => {
          const c = getComputedStyle(el, pseudo);
          if (c.content === 'none' || c.position !== 'absolute') return 0;
          const n = (v) => (v.endsWith('px') ? -parseFloat(v) : 0);
          return Math.max(0, n(c.top)) + Math.max(0, n(c.bottom));
        };
        const effH = r.height + Math.max(grow('::after'), grow('::before'));
        if (effH < 32 || r.width < 24) {
          small.push(`${(el.className || el.tagName).toString().split(' ')[0]}:${Math.round(r.width)}x${Math.round(effH)}`);
        }
      });
      return { scrollW: de.scrollWidth, clientW: de.clientWidth,
               over: [...new Set(over)].slice(0, 5), small: [...new Set(small)].slice(0, 5) };
    });

    const hOver = audit.scrollW > audit.clientW + 1;
    if (hOver || audit.over.length || audit.small.length) problems++;
    rows.push(
      `    ${name.padEnd(9)} ${hOver ? `H-SCROLL ${audit.scrollW}/${audit.clientW}` : 'ok'}` +
      (audit.over.length ? `  overflow:[${audit.over.join(',')}]` : '') +
      (audit.small.length ? `  small-target:[${audit.small.join(',')}]` : '')
    );
    if (w === 430 || w === 1024) {
      await mkdir(OUT, { recursive: true });
      await page.screenshot({ path: `${OUT}/r-${name}-${w}.png`, fullPage: true });
    }

    // Checkout renders one step at a time, so visiting the route only ever
    // audits step 1. Walk the rest — the payment step in particular packs two
    // inputs side by side and is the widest thing in the flow.
    if (name === 'checkout') {
      const steps = await page.locator('.steps__btn').count();
      for (let i = 1; i < steps; i++) {
        await page.locator('.steps__btn').nth(i).evaluate((el) => {
          el.disabled = false;   // reach the step without completing the form
          el.click();
        });
        await page.waitForTimeout(350);
        const a = await page.evaluate(() => ({
          s: document.documentElement.scrollWidth, c: document.documentElement.clientWidth,
        }));
        if (a.s > a.c + 1) {
          problems++;
          rows.push(`    ${('checkout·' + (i + 1)).padEnd(9)} H-SCROLL ${a.s}/${a.c}`);
        }
      }
    }
  }
  console.log(`\n== ${label} ==`);
  console.log(rows.join('\n'));
  if (errs.length) console.log('    JS ERRORS:', [...new Set(errs)].slice(0, 3).join(' | '));
  await ctx.close();
}
console.log(problems === 0 ? '\nALL CLEAN' : `\n${problems} route/width combinations flagged`);
await browser.close();
