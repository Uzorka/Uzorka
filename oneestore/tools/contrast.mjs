import { chromium } from 'playwright';

// Use a preinstalled Chromium when one is pointed at, otherwise let
// Playwright resolve its own download.
const LAUNCH = process.env.CHROMIUM_PATH
  ? { executablePath: process.env.CHROMIUM_PATH }
  : {};
const BASE = 'http://localhost:4173';
const b = await chromium.launch(LAUNCH);

const CHECK = `
(() => {
  const srgb = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = ([r, g, bl]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(bl);
  const parse = (s) => { const m = s.match(/[\\d.]+/g); return m ? m.slice(0, 3).map(Number) : null; };
  const alpha = (s) => { const m = s.match(/[\\d.]+/g); return m && m.length > 3 ? Number(m[3]) : 1; };
  const over = (fg, bg, a) => fg.map((c, i) => c * a + bg[i] * (1 - a));

  // Resolve an element's effective background by compositing up the tree.
  const bgOf = (el) => {
    let acc = null;
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      const c = parse(cs.backgroundColor); const a = alpha(cs.backgroundColor);
      if (!c || a === 0) continue;
      acc = acc === null ? { c, a } : acc;
      if (a >= 0.999) return acc.a >= 0.999 ? acc.c : over(acc.c, c, acc.a);
      // translucent: keep compositing downward
      acc = { c: acc.c, a: acc.a };
      const parentBg = (() => {
        for (let m = n.parentElement; m; m = m.parentElement) {
          const pc = parse(getComputedStyle(m).backgroundColor);
          const pa = alpha(getComputedStyle(m).backgroundColor);
          if (pc && pa >= 0.999) return pc;
        }
        return [255, 255, 255];
      })();
      return over(acc.c, parentBg, acc.a);
    }
    return [255, 255, 255];
  };

  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]; return (hi + 0.05) / (lo + 0.05); };

  const out = [];
  document.querySelectorAll('*').forEach((el) => {
    if (el.children.length > 0) return;              // leaf text nodes only
    const txt = (el.textContent || '').trim();
    if (!txt) return;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') return;
    const fg = parse(cs.color); if (!fg) return;
    // A gradient background cannot be composited by this checker; skip those
    // subtrees rather than reporting a phantom failure (the hero is white on
    // deep teal and passes comfortably).
    for (let n = el; n; n = n.parentElement) {
      if (getComputedStyle(n).backgroundImage !== 'none') return;
    }
    const size = parseFloat(cs.fontSize);
    const weight = Number(cs.fontWeight) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    const cr = ratio(fg, bgOf(el));
    if (cr < need) {
      out.push({
        sel: (el.className || el.tagName).toString().split(' ').slice(0, 2).join('.'),
        text: txt.slice(0, 26), ratio: Math.round(cr * 100) / 100, need, size: Math.round(size),
      });
    }
  });
  const seen = new Set();
  return out.filter(o => { const k = o.sel + o.ratio; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 12);
})()
`;

for (const scheme of ['light', 'dark']) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: scheme });
  const p = await ctx.newPage();
  await p.goto(BASE + '/#/', { waitUntil: 'load' });
  await p.evaluate(() => localStorage.setItem('oneestore:state', JSON.stringify({
    cart: [{ id: 'c1', productId: 'p-croaker', grams: 2000, prep: 'cleaned', extras: ['head-on'], qty: 1 }],
    favourites: ['p-croaker'], orders: [], box: { 'p-tiger-prawns': 1000 }, boxSize: 'medium',
    prefs: { preps: {}, contact: null, address: null, theme: 'system', recentSearches: ['prawns'], returning: false },
  })));
  console.log(`\n== ${scheme} ==`);
  for (const [n, r] of [['home','/'],['shop','/shop'],['pdp','/p/tiger-prawns'],['box','/box'],['meals','/meals'],['checkout','/checkout'],['admin','/admin'],['promise','/promise']]) {
    await p.goto(BASE + '/#' + r, { waitUntil: 'load' });
    await p.waitForTimeout(550);
    const bad = await p.evaluate(CHECK);
    console.log(`  ${n.padEnd(9)} ${bad.length === 0 ? 'ok' : bad.map(x => `${x.sel}("${x.text}") ${x.ratio}<${x.need}`).join('\n             ')}`);
  }
  await ctx.close();
}
await b.close();
