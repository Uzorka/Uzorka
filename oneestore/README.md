# ONEESTORE

Fresh seafood, sold by the kilogram at the morning's market price, cleaned the
way you ask and delivered across Lagos the same day.

Built with **Next.js (App Router) + TypeScript + Tailwind 4**, with the
pricing engine as a pure, tested module underneath.

Design canvas (18 artboards, private):
<https://claude.ai/artifact/6Y6YpV2c15UvhKHCiKy7ai>
Product, design and build plan: [`../docs/seafood-store-plan.md`](../docs/seafood-store-plan.md)

---

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run check      # typecheck + tests — run this before every push
npm run test       # vitest
npm run typecheck  # tsc --noEmit
npm run build      # production build
```

No environment variables are needed yet: the storefront reads a seed catalog.
`.env.example` lists what M2 onwards will need.

---

## The one thing to understand before changing anything

**Money is an integer count of kobo. Weight is an integer count of grams.**

Never a float, never naira, never `2.5` kilograms. Every field that carries one
says so in its name — `pricePerKgKobo`, `weightG` — so a float cannot slip
through review unnoticed.

Everything unusual in this codebase follows from selling by weight at a price
that moves every morning:

| Rule | Where it lives |
|---|---|
| Weight snaps to the product's step and clamps to stock | `normalizeWeight` |
| Preparation surcharges are per kilogram, not per line | `priceLine` |
| Filleting loses about half the weight, and we say so up front | `PrepOption.yieldBps` |
| Tomorrow's price never re-prices yesterday's order | `CartLine.unitPricePerKgKoboSnapshot`, `priceDrift` |
| Packed weight must land within ±8% of what was ordered | `TOLERANCE_BPS`, `isWithinTolerance` |
| Packed under → wallet credit. Packed over → we absorb it | `reconcileLine` |
| A card is **never** charged above the authorised amount | `reconcileLine` |

That last rule is not a preference. Charging a card above what the customer
approved collects chargebacks and destroys the trust the whole proposition
rests on, so the engine has no code path that can do it.

`src/lib/pricing.ts` is pure — no I/O, no React, no framework. It is covered by
64 tests in `pricing.test.ts` and `delivery.test.ts`, several of which assert
the exact figures used in the design so the screens and the maths cannot drift
apart.

---

## Layout

```
src/
  app/                    routes (App Router)
    page.tsx              home
    shop/                 catalog by category
    product/[slug]/       product + the three-step customizer (client)
    search/               live search, matches local names
    basket/  orders/      honest empty states until M2
    globals.css           design tokens, glass, motion
  components/
    ui/                   Button, Badge, Price, Selectors, Skeleton, EmptyState…
    BottomNav.tsx         floating glass nav
    TopBar.tsx            glass header
    ProductCard.tsx
    CutoffBanner.tsx      same-day countdown (client — it depends on the minute)
  lib/
    types.ts              Kobo, Grams, Product, CartLine…
    money.ts              kobo/gram helpers and formatting
    pricing.ts            THE ENGINE — weight, prices, tolerance, box, meals
    delivery.ts           zones, fees, cut-off, slots
    seed.ts               placeholder catalog
supabase/migrations/      schema with RLS
```

### Design language

Glass only ever sits **over content** — navigation, floating controls, sheets,
drawers. Content areas stay opaque so they can be scanned, and glass never
carries body copy. Where `backdrop-filter` is unsupported the opacity rises
until readability is safe.

Motion runs on seven shared tokens (`--m-fast` … `--m-exit`) defined in
`globals.css`. No component invents its own timing, only `transform` and
`opacity` are animated, and `prefers-reduced-motion` collapses every token to
an 80ms opacity fade — state still confirms, nothing travels.

---

## Where this is up to

**Done — M0 and M1:** design tokens and component library, the pricing and
delivery engines with full test coverage, and the storefront read path (home,
shop, product with working weight/preparation customization, live search).

**Not done yet:** the basket and orders pages are honest empty states, because
there is no cart store or backend behind them. Build Your Box and Shop by Meal
have engine support (`priceBox`, `mealQuantities`) and designs, but no screens.

**Next — M2:** cart store with stock reservation, then Supabase behind the
catalog, then Paystack and the order state machine.

All catalog data is **placeholder**. Prices, stock, ratings, the ±8% band, zone
fees, the 11 AM cut-off and the box tiers need your real numbers before launch,
and every image is a labelled placeholder until the photography exists.

---

## Moving this into its own repository

This lives in a subdirectory for now because the session that built it could not
create a repository. To give it its own:

```bash
# create an empty repo named `oneestore` on GitHub, then:
cd oneestore
git init && git add -A
git commit -m "ONEESTORE: design system, pricing engine, storefront read path"
git remote add origin git@github.com:<you>/oneestore.git
git push -u origin main
```

Nothing in the code depends on the parent repository, apart from the two
relative documentation links at the top of this file.
