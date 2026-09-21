# ONEESTORE

Fresh seafood, ordered simply. A storefront for Lagos seafood delivery, where
the customer chooses what they want, how much, and exactly how it should be
prepared — and can see what that leaves them with before they pay.

The goal is that buying seafood here is simpler than a phone call, a WhatsApp
thread, an Instagram DM or a trip to the market. A first-time customer should
be able to shop without instructions.

**[DESIGN.md](DESIGN.md) is the companion to this file** — tokens, the motion
system, the glass rules, the component catalogue and the review gates.

---

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build
npm run preview    # serve the build on :4173
```

Node 20+. No backend: the catalogue is static data and state persists to
`localStorage`, so the whole purchase flow — including live order tracking —
runs locally.

---

## What is here

**Customer**

- **Home** — three ways to shop, today's landings, categories, meals. A
  returning customer gets their re-order rail first instead.
- **Shop** — category rail, sticky glass toolbar, filters and sort in a sheet
  on phones and a dialog on desktop, skeleton loading that holds the layout.
  Filters live in the URL, so a filtered view is shareable and Back undoes it.
- **Product** — the three-step customisation inline, with live price, live
  prepared-weight estimate, and one obvious primary action.
- **Build Your Box** — the signature interaction. Tiles spring into a box that
  visibly fills; tap always works, drag is an optional accelerator.
- **Shop by Meal** — six dishes, each with a real shopping list already
  reasoned through, scalable by servings and editable line by line.
- **Basket** — drawer on desktop, full screen on phones, one shared body.
- **Checkout** — five short steps with visible progress, inline validation,
  preserved answers, a visual date rail, and unserved areas that explain
  themselves and offer alternatives.
- **Order tracking** — seven stages that advance live while the page is open,
  with timestamps and an animating connector.
- **Orders, Saved, Account, Fresh Promise.**

**Operations** (`#/admin`)

Built to answer five questions in the first screenful: what needs attention,
what needs sourcing, what needs preparing, what goes out today, and whether
there are customer problems. Command-style quick actions. On phones the tables
become cards rather than shrinking.

---

## Shape of the code

```
src/
  styles/      tokens.css  ← the single source of colour, space, depth, motion
               base.css · components.css · overlays.css · nav.css
               product.css · screens.css
  design/      motion.ts (JS half of the motion system) · icons.tsx (own set)
  lib/         router · hooks (media, focus trap, presence, swipe, count-up)
               format (naira, weight, dates) · storage · id
  data/        types · catalog · meals · delivery (zones, slots, stages)
  state/       store.tsx (reducer + overlay layer) · pricing.ts
  components/  primitives, overlays, and the seafood-specific selectors
  screens/     one file per route
tools/         the automated design review (see below)
```

Three deliberate choices:

- **No UI or animation dependencies.** React and nothing else. Motion is CSS
  custom properties plus the Web Animations API, which is what makes
  `prefers-reduced-motion` a six-line change rather than a per-component audit.
- **One pricing engine.** `state/pricing.ts` feeds the product page, the
  customisation sheet, the basket and the order, so no two surfaces can show
  different money.
- **One overlay owner.** The store holds a single `overlay` value, so a sheet
  can never end up behind a drawer.

### Product imagery

`ProductArt` draws a deterministic tile per product — a water gradient in the
product's hue plus an original line silhouette for its species group. It is
placeholder artwork for real photography: replace that one component with an
`<img>` and every card, sheet, basket row and order line inherits real photos
with no other change.

---

## Design review

The brief's "review every screen at five widths" is automated:

```bash
npm run review:responsive   # 13 screens × 375/430/768/1024/1440
npm run review:contrast     # every text/background pair, light + dark
npm run review:glass        # rendered-pixel contrast on each glass surface
npm run review:flow         # drives a full purchase end to end
```

Run `npm run preview` first — they drive the built app on `:4173`. They need
Playwright's Chromium; set `PLAYWRIGHT_BROWSERS_PATH` if it is installed
somewhere unusual.

Current state: responsive clean at all five widths, contrast clean in both
themes, glass AA or better on every surface measured, purchase flow passing
with no console errors.
