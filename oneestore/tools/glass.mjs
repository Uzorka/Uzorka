import { chromium } from 'playwright';

// Use a preinstalled Chromium when one is pointed at, otherwise let
// Playwright resolve its own download.
const LAUNCH = process.env.CHROMIUM_PATH
  ? { executablePath: process.env.CHROMIUM_PATH }
  : {};
const BASE = 'http://localhost:4173';
const b = await chromium.launch(LAUNCH);

/**
 * Sample the real rendered pixels of one text node sitting on a glass surface
 * and compare the glyph core against its local background. Direction-agnostic,
 * so it is valid in both themes, and it sees what the blur actually lets
 * through rather than trusting the declared background colour.
 */
async function textOnGlass(page, label, picks) {
  const rows = [];
  for (const [what, sel] of picks) {
    const box = await page.evaluate((s) => {
      const el = document.querySelector(s);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      if (r.width < 6 || r.height < 6) return null;
      // pad a little so the sample includes the surface around the glyphs
      const x = Math.max(0, Math.round(r.x) - 2);
      const y = Math.max(0, Math.round(r.y) - 2);
      return { x, y,
        width: Math.round(Math.min(r.width + 4, innerWidth - x)),
        height: Math.round(Math.min(r.height + 4, innerHeight - y)) };
    }, sel);
    if (!box) { rows.push(`    ${what.padEnd(26)} (not found)`); continue; }

    const buf = await page.screenshot({ clip: box });
    const res = await page.evaluate(async (dataUrl) => {
      const img = new Image();
      await new Promise((r2, j) => { img.onload = r2; img.onerror = j; img.src = dataUrl; });
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      c.getContext('2d').drawImage(img, 0, 0);
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      const lums = [];
      for (let i = 0; i < d.length; i += 4) lums.push(0.2126 * f(d[i]) + 0.7152 * f(d[i+1]) + 0.0722 * f(d[i+2]));
      lums.sort((a, b) => a - b);
      // Glyph cores are a small share of a wide text box, so a 5th-percentile
      // sample lands on the surface, not the type. Trim only anti-aliasing
      // outliers and take the extremes.
      const q = (t) => lums[Math.min(lums.length - 1, Math.floor(lums.length * t))];
      return { lo: q(0.004), hi: q(0.996) };
    }, 'data:image/png;base64,' + buf.toString('base64'));

    const ratio = (res.hi + 0.05) / (res.lo + 0.05);
    rows.push(`    ${what.padEnd(26)} ${ratio.toFixed(2)}:1 ${ratio >= 4.5 ? 'ok' : 'LOW'}`);
  }
  console.log(`  ${label}\n${rows.join('\n')}`);
}

for (const scheme of ['light', 'dark']) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: scheme });
  const p = await ctx.newPage();
  await p.goto(BASE + '/#/', { waitUntil: 'load' });
  await p.evaluate(() => localStorage.setItem('oneestore:state', JSON.stringify({
    cart: [{ id: 'c1', productId: 'p-croaker', grams: 2000, prep: 'cleaned', extras: ['head-on'], qty: 1 }],
    favourites: [], orders: [], box: {}, boxSize: 'medium',
    prefs: { preps: {}, contact: null, address: null, theme: 'system', recentSearches: ['prawns'], returning: false },
  })));
  await p.reload({ waitUntil: 'load' }); // hash-only navigation would not re-read the seed
  console.log(`\n== ${scheme} ==`);

  await p.goto(BASE + '/#/shop', { waitUntil: 'load' });
  await p.waitForTimeout(600);
  await p.evaluate(() => scrollTo({ top: 700, behavior: 'instant' }));
  await p.waitForTimeout(400);
  await textOnGlass(p, 'glass nav + sticky toolbar over scrolled cards', [
    ['nav link', '.navlink.is-on'],
    ['brand wordmark', '.brand__word'],
    ['toolbar count', '.shopbar__count'],
    ['toolbar button label', '.shopbar__btn span'],
  ]);

  await p.locator('.navsearch, .topnav__searchicon').first().click();
  await p.waitForTimeout(600);
  await p.locator('.searchov__input').fill('praw');
  await p.waitForTimeout(600);
  await textOnGlass(p, 'search overlay on glass', [
    ['suggestion name', '.srow__name'],
    ['suggestion price', '.srow__price'],
    ['section heading', '.searchov__h'],
  ]);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(500);

  await p.locator('.navbtn--cart').click();
  await p.waitForTimeout(700);
  await textOnGlass(p, 'cart drawer on glass', [
    ['drawer title', '.drawer__title'],
    ['line name', '.cline__name'],
    ['line config', '.lineconfig'],
    ['footer total', '.cartdrawer__total .atotal'],
  ]);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(500);

  await p.locator('.pcard').filter({ hasText: 'Tiger Prawns' }).first().hover();
  await p.waitForTimeout(250);
  await p.locator('.pcard').filter({ hasText: 'Tiger Prawns' }).first().locator('.qadd').click();
  await p.waitForTimeout(700);
  await textOnGlass(p, 'customise dialog on glass', [
    ['product name', '.cust__name'],
    ['prep option note', '.ptile__note'],
    ['footer total', '.cust__foottotal'],
  ]);
  await ctx.close();
}

const m = await b.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
const mp = await m.newPage();
await mp.goto(BASE + '/#/shop', { waitUntil: 'load' });
await mp.waitForTimeout(700);
await mp.evaluate(() => scrollTo({ top: 600, behavior: 'instant' }));
await mp.waitForTimeout(400);
console.log('\n== mobile ==');
await textOnGlass(mp, 'floating bottom nav over product grid', [
  ['active tab label', '.tabbtn.is-on .tabbtn__label'],
  ['inactive tab label', '.tabbtn:not(.is-on) .tabbtn__label'],
]);
await m.close();
await b.close();
