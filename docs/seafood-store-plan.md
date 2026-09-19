# Lagos Seafood Store — Product & Build Plan

Working name: **Okùn** (Yoruba, "sea") — placeholder, easy to change.
Scope: **Lagos only** for v1.
Date: 19 September 2026.

Screen designs (private artifact, 8 artboards):
<https://claude.ai/artifact/6Y6YpV2c15UvhKHCiKy7ai>

---

## 1. Decisions locked

| Decision | Choice | Consequence |
|---|---|---|
| Codebase | **New separate repo** | Bible Explained stays untouched on `main` here |
| v1 depth | **Full-stack, real orders** | Database, auth, payments and an admin dashboard from day one |
| Payments | **Paystack** | Card, bank transfer, USSD, Verve. Webhook-verified |
| Pricing | **Per kg, customer picks weight** | Weight-based cart, weight tolerance policy, actual-weight reconciliation |

Pay-on-delivery is kept as a second rail because a meaningful share of Lagos
customers will not prepay a new vendor for perishables. It is a toggle, not a
rewrite — the order state machine supports both from the start.

---

## 2. The one hard problem: selling by weight

Everything unusual in this build comes from per-kg pricing. Fish is not a
widget: what you pack is never exactly what was ordered, and the market price
moves every morning.

**Rules the system enforces:**

1. **Money is integers.** All amounts stored in **kobo** (`BIGINT`). Never a
   float anywhere near a price. Weights stored in **grams** (`INTEGER`), never
   `2.5` as a float.
2. **Order weight vs packed weight.** Each order line carries
   `ordered_g` and, after packing, `actual_g`. The customer is charged on
   `actual_g`.
3. **Tolerance band: ±8%.** Packers cannot save a line outside the band without
   a supervisor override and a reason — that is the guardrail against shrinkage
   and against disputes.
4. **Reconciliation direction matters.**
   - Packed **under** → refund the difference to **store-credit wallet**
     (instant, no payment-gateway round-trip, and it brings the customer back).
     Cash refund on request.
   - Packed **over** → absorb it up to the 8% band. Never silently charge a
     card more than the authorised amount; that destroys trust and invites
     chargebacks.
5. **Price snapshot at order time.** `order_items.unit_price_kobo` is copied
   from the product at checkout. A price change tomorrow never re-prices
   yesterday's order.
6. **Stale-cart handling.** A cart holding a price older than today's publish
   shows a "today's price is ₦X" diff and requires an explicit re-accept before
   payment. Silent re-pricing at checkout is the fastest way to lose a customer.
7. **Prep surcharges are per-kg, not per-line.** Gutted & scaled, steaks,
   fillet each add a `surcharge_per_kg_kobo` to the effective unit price. The
   fillet yield loss is priced into the surcharge, not deducted from weight.
8. **Stock is in grams and reserved, not decremented.** Adding to cart places a
   soft reservation with a TTL (20 min); payment converts it to a hard
   decrement; expiry releases it. Without this, two customers buy the same last
   6 kg of prawns.

---

## 3. Lagos realities that shape the design

These are not garnish — each one changes a screen or a table.

| Reality | What it forces into the build |
|---|---|
| Cold chain is the whole product | Delivery **windows** not "3–5 days"; insulated-box messaging; a same-day **cut-off time** (11:00 AM) with a live countdown |
| Lagos geography is brutal | **Zone-based** delivery fees (Island / Lekki–Ajah / Mainland central / Outer), not distance maths. Third Mainland Bridge traffic makes promises unreliable |
| Addresses are unreliable | **Landmark field is required**, optional map pin, phone number required. A rider calls; they do not read a postcode |
| Phone-first, WhatsApp-native | **Phone OTP** as the primary auth; WhatsApp for order updates and support; click-to-chat everywhere |
| Nigerian fish names | Search must match **"apoda" → croaker, "titus" → mackerel, "ede" → shrimp, "panla" → hake, "osan" → red snapper, "shawa" → bonga, "isam" → periwinkle**. A synonym table, not just full-text search |
| Prepayment distrust | Reviews with verified-purchase badges, the weighing clip, a plain refund policy, and pay-on-delivery |
| Data is expensive, networks are slow | Aggressive image optimisation, PWA with an offline catalog, server-rendered pages, no heavy client bundles |
| Naira presentation | `₦` prefix, thousands separators, kobo hidden. `₦9,800/kg` |

---

## 4. How it looks

**Positioning:** premium-but-honest market stall, not a supermarket. The trust
story (weighed on camera, charged on real weight, unbroken cold chain) is the
hero, because that is the actual objection to overcome.

**Palette** — ocean-and-salt, two accents sharing chroma:

| Token | Hex | Use |
|---|---|---|
| Salt | `#F7F5F0` | page ground |
| Abyss | `#0B2B2E` | ink, dark bands |
| Lagoon | `#0F5D57` | secondary surfaces, links, icons |
| Clay | `#C64A26` | primary CTA, "add", price movement up |
| Deep green | `#1C6B4A` | in-stock, confirmations, price movement down |
| Amber | `#92500C` on `#FBEFD8` | cut-off countdown, weight policy |
| Line | `#E2DED4` | borders |

**Type:** **Fraunces** (display serif) for headings and prices on the
storefront — warm, food-appropriate, and it is what makes the brand not look
like a template. **Plus Jakarta Sans** for everything else. Admin stat values
stay in the sans (a serif hero number reads as decoration on a dashboard).

**Photography:** the make-or-break asset. Fish on ice, shot overhead in
daylight, consistent crop. The mockups mark every image area as a labelled
placeholder — budget a half-day shoot before launch. Stock photos of salmon
fillets will actively hurt credibility here.

### Customer screens

1. **Home** — cut-off countdown, today's-catch hero, category tiles, today's
   market-price board, trust block, bottom tab bar.
2. **Catalog** — search with Nigerian-name synonyms, filter chips (prep, fresh
   vs frozen, size grade, availability), rows showing `₦/kg` and live stock.
3. **Product** — gallery, price per kg, **prep selector**, **weight stepper**
   (0.5 kg steps, min 1 kg, quick 1/2/3/5 kg pills), live total, the ±8%
   explanation, zone-aware delivery line, cooking note.
4. **Cart** — per-line weight steppers, cleaning charges broken out separately
   from fish, zone delivery fee, free-delivery progress, promo field, cut-off
   warning.
5. **Checkout** — 3 steps: contact (phone, SMS-verified) → delivery (zone →
   address → landmark → map pin → slot) → payment (Paystack / pay on delivery /
   apply wallet credit).
6. **Order tracking** — status timeline, the **weight reconciliation card**
   (ordered vs packed vs refunded), rider card with call + WhatsApp, delivery
   OTP, 2-hour quality-complaint window.
7. **Account** — orders, one-tap reorder, addresses, wallet ledger, favourites,
   referrals.

### Admin screens

1. **Dashboard** — orders today, kg still to pack, revenue, weight-refund rate.
2. **Prices & stock** ← *the screen staff use every single morning.* Yesterday's
   price beside an editable today's price, computed change %, stock in kg,
   live/hide toggle per product, "copy yesterday", one **Publish to storefront**
   action. Designed as a single-screen board, not a per-product edit form.
3. **Packing queue** — order by order: enter packed weight per line, see the
   auto-computed refund, print a packing slip, assign a rider.
4. **Orders** — filters, state machine actions, refunds, notes.
5. **Riders & zones** — zone fees, slot capacity per zone per day, rider
   assignment, delivery proof.
6. **Products, Customers, Promos, Reports, Settings.**

---

## 5. Function map

### Must have to take a real order (v1)

**Catalog & pricing**
- Products with `price_per_kg_kobo`, `min_order_g`, `step_g`, `stock_g`
- Prep variants with per-kg surcharge; size grades
- Categories; search with a Nigerian-name synonym table
- Daily price publish with full `price_history` and an audit trail
- Availability states: available today / pre-order tomorrow / hidden

**Cart & checkout**
- Weight-based cart; guest carts (cookie) and persisted carts (DB)
- **Guest checkout** — never force signup before a first order
- Zone-based delivery fee engine; free delivery threshold
- Slot picker with same-day cut-off and per-zone capacity
- Stock reservation with TTL
- Paystack: initialise → pay → **webhook-verified** → order created
- Pay on delivery, gated behind a verified phone number
- Idempotency keys on order creation (double-tap on 3G is guaranteed)

**Accounts**
- Phone OTP (Termii or Africa's Talking), email/password fallback, Google OAuth
- Address book with landmark + optional geo pin
- Order history, one-tap reorder
- Wallet / store-credit ledger (append-only)

**Orders & ops**
- State machine: `pending_payment → paid → packing → packed → dispatched →
  delivered`, plus `cancelled`, `refunded`, `on_hold`
- Packed-weight capture → automatic price adjustment → wallet credit
- Packing slips and a rider manifest
- Delivery OTP confirmation
- Notifications at each state: WhatsApp Cloud API, SMS fallback, email
- Quality complaint with photo upload, 2-hour window

**Admin**
- Role-based access: owner / manager / packer / rider
- The daily price & stock board
- Packing queue and order management
- Audit log on every price and order mutation

### Second wave (weeks after launch)

Reviews with verified-purchase badges and photos · recipe/blog content for SEO ·
loyalty points · referral links · abandoned-cart WhatsApp nudge · bundles and
party packs · subscriptions ("2 kg croaker every Friday") · restaurant/B2B
accounts with invoice terms · rider live location · multi-hub inventory ·
Flutterwave as a second gateway · Lagos-wide → Ibadan/Abuja expansion.

### Non-functional

- SEO: `Product` + `LocalBusiness` schema, sitemap, per-product pages
- PWA with offline catalog; images in AVIF/WebP with explicit sizes
- Rate limiting on OTP and checkout endpoints; CSP; RLS on every table
- Analytics: Vercel Analytics + PostHog funnels
- Tests: **unit tests on the pricing and fee engine are non-negotiable**
  (this is where money bugs live), Playwright e2e on the checkout path
- Error tracking: Sentry

---

## 6. Data model (first cut)

```
products            id, slug, name, local_names[], category_id, description,
                    price_per_kg_kobo, min_order_g, step_g, stock_g,
                    size_grade, origin, is_live, availability, images[]
prep_options        id, product_id, name, surcharge_per_kg_kobo, sort
categories          id, slug, name, icon, sort
price_history       id, product_id, price_per_kg_kobo, effective_date,
                    published_by, published_at
inventory_moves     id, product_id, delta_g, reason, order_id, actor_id, at

customers           id, phone (unique), phone_verified_at, email, name,
                    wallet_balance_kobo
addresses           id, customer_id, zone_id, street, landmark, lat, lng,
                    is_default
wallet_ledger       id, customer_id, delta_kobo, reason, order_id, at

delivery_zones      id, name, areas[], fee_kobo, free_threshold_kobo, is_active
delivery_slots      id, zone_id, date, window, capacity, booked, cutoff_at

carts               id, customer_id, session_token, expires_at
cart_items          id, cart_id, product_id, prep_option_id, weight_g,
                    unit_price_kobo_snapshot, reserved_until

orders              id, code, customer_id, address_id, slot_id, status,
                    subtotal_kobo, prep_kobo, delivery_kobo, discount_kobo,
                    wallet_applied_kobo, total_kobo, payment_method,
                    delivery_otp, placed_at
order_items         id, order_id, product_id, prep_option_id,
                    ordered_g, actual_g, unit_price_kobo, line_total_kobo
payments            id, order_id, provider, provider_ref, amount_kobo,
                    status, raw_webhook jsonb, verified_at
deliveries          id, order_id, rider_id, dispatched_at, delivered_at,
                    proof_photo_url
riders              id, name, phone, vehicle, plate, is_active

reviews             id, product_id, customer_id, order_id, rating, body,
                    photos[], is_verified_purchase
promos              id, code, kind, value, min_order_kobo, uses, max_uses,
                    expires_at
admin_users         id, email, role
audit_log           id, actor_id, action, entity, entity_id, before, after, at
```

Two notes: `local_names[]` is what makes "apoda" find croaker, and
`audit_log` exists because price edits and weight overrides are exactly the
operations that will need explaining later.

---

## 7. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Server rendering for SEO and slow networks; one deployable for storefront + admin + API routes |
| Styling | **Tailwind CSS** | Fast, and the token set above maps cleanly to a config |
| Database | **Supabase Postgres** with RLS | Managed Postgres, auth, storage and realtime in one; RLS keeps customer data isolated |
| Auth | Supabase Auth + phone OTP via **Termii** | Termii has better Nigerian SMS deliverability than generic providers |
| Payments | **Paystack** (inline + webhooks) | Nigerian rails, good docs, reliable webhooks |
| Images | Supabase Storage + Next `<Image>` | AVIF/WebP, sized variants |
| Messaging | **WhatsApp Cloud API**, SMS fallback | Where Lagos customers actually read updates |
| Hosting | **Vercel** | Zero-config for Next.js; the repo already has a Vercel setup pattern |
| Errors / analytics | Sentry + PostHog | |

Paystack webhooks must be verified by HMAC signature and processed
idempotently. An order is only `paid` when the webhook says so — never on the
client's success callback.

---

## 8. Milestones

| # | Deliverable | Notes |
|---|---|---|
| **M0** | Repo, Next.js + Tailwind + Supabase skeleton, design tokens, seed catalog | The palette and type above become a Tailwind config |
| **M1** | Storefront read path: home, catalog, product, search with synonyms | Real data from Supabase, no writes |
| **M2** | Weight cart + pricing engine + **unit tests on the money maths** | The engine is pure and tested before any UI depends on it |
| **M3** | Auth (phone OTP), addresses, zones, slots, cut-off logic | |
| **M4** | Checkout + Paystack + webhooks + order state machine + emails | First real order possible at the end of this |
| **M5** | Admin: price & stock board, packing queue with weight capture, wallet refunds, rider manifest | The business cannot operate without M5 |
| **M6** | WhatsApp/SMS notifications, reviews, promos, wallet UI | |
| **M7** | SEO, recipe content, PWA, load testing, launch hardening | |

M2 before M3 is deliberate: the pricing engine is the highest-risk code in the
project and it needs to be correct in isolation, not debugged through a UI.

---

## 9. Off-code work that blocks launch

Flagging these because they gate go-live regardless of how the code goes:

- **CAC registration** — Paystack needs a registered business (with a corporate
  bank account) for a full business account and settlements. The starter tier
  works for testing; do not discover this in launch week.
- **Lagos State food-handling permit** for the cold room / packing space.
  (NAFDAC registration applies to packaged processed products, not fresh fish
  retail — worth confirming with a consultant if you later sell packaged
  smoked fish.)
- **Cold room + certified weighing scale.** The scale is a product feature, not
  just equipment; the trust story depends on it being calibrated.
- **Supply relationships** at Epe / Badagry / Makoko, and a daily price-discovery
  routine — someone has to walk the market or call by 5:30 AM.
- **Rider capacity** — own riders or a partner, plus a cash-reconciliation
  process for pay-on-delivery.
- **NDPR / Nigeria Data Protection Act 2023** compliance: privacy policy,
  lawful basis, and a data-protection filing if you cross the threshold.
- **Terms, refund and quality-guarantee policies**, written before the first
  complaint rather than after.
- **Product photography** — half a day, consistent lighting, every SKU.

---

## 10. Open questions

1. **Repo name** for the new repository.
2. **Delivery fleet**: own riders, or a partner (Gokada/Kwik-style) for v1?
   This changes the rider and delivery tables.
3. **Fee values**: the zone fees, ±8% band, 11:00 AM cut-off and ₦100,000
   free-delivery threshold in the mockups are plausible placeholders. Your real
   numbers should replace them before M1.
4. **B2B from the start?** Restaurants and party caterers are the highest-value
   segment, but invoice terms and bulk pricing add real scope. Currently
   scheduled as second-wave.
5. **Catalog breadth at launch** — 14 kinds is shown. Fewer SKUs done reliably
   beats a wide catalog that is half out of stock.

---

*All figures, product names, prices, ratings and customer details in the
mockups and in this document are placeholder sample data for design purposes.*
