# ONEESTORE — design system

The interface was designed as architecture, not decoration. Tokens, motion
roles and primitives exist before any screen does, and every screen is
assembled from them. This document is the contract: what exists, what each
variant is for, and the rules that keep forty screens feeling like one product.

---

## 1. Identity

ONEESTORE sells seafood in Lagos. The palette is coastal and its own:

| Role | Light | Dark | Used for |
|---|---|---|---|
| **Tide** (brand) | `#0a7078` | `#5cc3c9` | Every primary action, selection, progress |
| **Ink** (text/depth) | `#06161c` | `#e9f3f4` | Type, dark surfaces |
| **Coral** (freshness) | `#f2603f` | `#ff8163` | Signal only — basket badge, "landed today" |
| **Sand** (premium) | `#c79343` | `#dfb473` | Ratings, chef picks, yield notes |

Coral is a *signal*, never decoration. If everything is urgent, nothing is.

Dark mode is not an inversion — the water gets deeper. Surfaces move from mist
to deep water, glass goes from white-frosted to ink-frosted, and the tide accent
lifts two steps so it still carries actions at the same weight.

**Type** is the platform sans stack, tracked tightly at display sizes
(`-0.026em`) and normally at body. Numerals use a tabular, rounded stack
(`.num`) so prices, weights and totals do not jitter as they animate.

---

## 2. Tokens

Everything lives in `src/styles/tokens.css`. Components reference variables and
never raw values — that single rule is what lets the app re-theme and calm down
from one file.

- **Colour** — brand/ink/coral/sand ramps, then *semantic* aliases
  (`--surface`, `--text-2`, `--brand`, `--line`). Components use only the
  semantic layer.
- **Space** — 4pt base, `--s-1` … `--s-10`. Page gutter is `16px` on phones and
  opens to `40px` at 1440.
- **Radius** — `--r-xs` 8 → `--r-2xl` 32, plus `--r-pill`.
- **Elevation** — `--e1` … `--e4`, soft and wide. Depth without heaviness.
- **Layers** — `--z-sticky` 20 → `--z-toast` 90. No component invents a z-index.
- **Chrome** — `--nav-h`, `--bottomnav-h`, `--safe-b/t`, and `--stickybar-h`
  (published at runtime, see §6).

### Contrast

`--text-3` is pinned to `#47707f` rather than the ramp's `--ink-400`: the ramp
value measures 4.0:1 on white and 4.4:1 on the page background, which is under
AA for the small print it carries. Every text/background pair in the system is
verified at AA in both themes — see §8.

---

## 3. Motion system

Six named roles. Components pick a *role*, never a number.

| Token | ms | Role |
|---|---|---|
| `--m-fast` | 130 | Interaction feedback: press, hover, ripple, badge |
| `--m-std` | 220 | State transition: selection, reveal, fade |
| `--m-page` | 300 | View-to-view navigation |
| `--m-spring` | 460 | Springy arrival: fly-to-basket, box tiles, confirm |
| `--m-modal` | 260 | Dialogs, popovers |
| `--m-drawer` | 340 | Drawers, bottom sheets |

Curves: `--e-out` (arriving), `--e-in` (leaving), `--e-inout` (moving within
view), `--e-spring` (confirming, overshoots), `--e-snap` (selection).

`src/design/motion.ts` mirrors these for the few animations that must be driven
from script (the fly-to-basket arc, count-ups). It reads the same numbers so
the two halves cannot drift.

**Reduced motion** collapses all six tokens to `1ms` at the source, so the whole
app calms down in six lines and no component needs to know. State still lands;
it simply lands instantly.

**Performance:** animation is restricted to `transform` and `opacity`. Keyframes
that would animate layout do not exist.

### What motion is for

State change, navigation, selection, feedback, hierarchy and continuity — never
ornament. Two deliberate exceptions carry brand rather than information: the
hero's drifting waves and the slow sheen across a product tile on hover. Both
are ambient, both stop under reduced motion.

---

## 4. Glass

Glass is funnelled through one component, `<GlassSurface>`. That is what stops
it spreading. It appears on **navigation, floating controls, bottom navigation,
the cart drawer, customisation panels, filters, modals, bottom sheets and
selected states** — and nowhere else. Content areas are opaque `<Card>`s so
they stay easy to scan.

| Tier | Fill | Used for |
|---|---|---|
| `nav` | 0.86 | Top bar — content scrolls beneath it |
| `floating` | 0.72 | Bottom nav, sticky bars, popovers, segmented thumb |
| `panel` | 0.55 | Light overlays on solid backgrounds |
| `sheet` | 0.86 | Sheets, drawers, dialogs — the most text-dense |
| `ink` | dark | Captions over photography |

Every tier carries a hairline border plus an inner top highlight, so the edge
stays visible over busy imagery. Transparency is capped so text always clears
4.5:1 — verified on rendered pixels, not just declared colours. Where
`backdrop-filter` is unsupported, `@supports` falls back to an opaque surface:
readability never depends on the effect being available.

---

## 5. Hierarchy

Every screen has exactly one primary action. The button variants are
deliberately far apart in weight, so the eye sorts them without reading:

| Variant | Weight | Example on the product page |
|---|---|---|
| `primary` | Filled tide, brand shadow | **Add to basket** |
| `secondary` | Outlined surface | Save |
| `ghost` | Soft tide tint | In-context affirmative |
| `quiet` | Text only | **Ask about this seafood** |
| `danger` | Soft red → solid on hover | Destructive confirmation |
| `glass` | Translucent | Controls over imagery |

Price, availability, weight, preparation and delivery are given prominence
wherever they are relevant, because those are the five things a seafood
customer needs before deciding.

---

## 6. Component catalogue

### Primitives

| Component | Variants | Notes |
|---|---|---|
| `Button` | 6 variants × 3 sizes | States: default, hover, pressed, focus, **loading**, **success**, disabled. Loading blocks re-entry — this is how duplicate submits are prevented. Press emits a ripple from the touch point. |
| `IconButton` | plain / soft / solid / glass; sm/md/lg | `label` is required; an icon-only control without a name is a bug. |
| `GlassSurface` | 5 tiers (§4) | The only place `backdrop-filter` appears. |
| `Card` | elevation 0–3, pad none/sm/md/lg, `interactive` | Opaque. Content areas never use glass. |
| `Price` | sm / md / lg / hero; tones default/brand/quiet | Optional unit and strikethrough. Tabular numerals. |
| `Badge` | neutral/ok/warn/bad/info/brand/sand/glass; sm/md | Tone never carries meaning alone — wording stands on its own. |
| `Chip` | selectable, optional count | Filters and tags. |
| `Skeleton` | raw, `SkeletonProductCard`, `SkeletonOrderCard` | Same dimensions as the real thing, so nothing jumps. |
| `SegmentedControl` | sm / md, `block` | One sliding thumb, not a background per segment — the movement *is* the feedback. |
| `QuantitySelector` | sm / md / lg | The digit slides in from the direction of travel. |
| `Field` | text/email/tel/password/number, multiline | Real labels (never placeholder-as-label), inline validation on blur then live, auto-formatting, password reveal, suggestions. |
| `OptionRow` | radio / check | Full-width tappable row with note and trailing slot. |
| `Switch` | — | 28px track, 44px hit area via a pulled-out pseudo-element. |
| `ProgressBar` | brand / ok / warn | |
| `Stat` | default/brand/warn/bad/ok | Labelled figure. |
| `EmptyState` | default / compact | Always names the next step. |
| `Toast` | ok / info / bad, optional action | Polite live region; sits above the bottom nav *and* any sticky bar. |
| `Reveal` | delay | One-shot fade-up on scroll, section level only. |

### Overlays

| Component | Desktop | Mobile |
|---|---|---|
| `BottomSheet` | — | Swipe-to-dismiss, drag handle, pinned footer |
| `Drawer` | Right slide-in | Swipe-to-dismiss |
| `Dialog` | Centred | — |
| `Adaptive` | Dialog **or** Drawer | Always a BottomSheet |
| `Popover` | Anchored menu | Callers use a sheet instead |

`Adaptive` is how the app keeps its promise not to force desktop patterns onto
phones: callers ask for a *purpose* and the component picks the form. Every
overlay traps focus, restores it to the opener, closes on Escape
(innermost first), locks body scroll with reference counting, and stays mounted
through its exit animation. Swipe is always paired with a visible close
control — a gesture is never the only way out.

### Domain components

| Component | Purpose |
|---|---|
| `ProductCard` | grid / rail / row. Image, name, price, unit, availability — nothing more. Save and quick-add reveal on hover where a pointer exists, and are permanently visible on touch. |
| `ProductArt` | Deterministic per-product artwork standing in for photography: a two-stop water gradient in the product's hue plus an original line silhouette. Swap for `<img>` and every surface inherits real photos. |
| `WeightSelector` | Preset tiles plus a custom slider. Never a bare number input. |
| `PreparationSelector` | Each option states what it means, what it costs, and the prepared weight it leaves you with. |
| `ExtrasSelector` | Context-filtered (skin-off only on fillets) and mutually-exclusive-aware (head on/off). |
| `DateSelector` | Horizontal day rail. Unavailable days stay visible and **explain themselves on tap**. |
| `WindowSelector` | Delivery time windows; full ones stay visible and say so. |
| `Timeline` | Order stages; the connector fills rather than snapping. |
| `SearchOverlay` | Three animated states: idle (recent, popular, categories), typing (suggestions with image, price, category), and nothing-found (a real explanation and a way forward). |
| `CustomizeSheet` | The three-step progressive customisation. |
| `StickyBar` | Publishes `--stickybar-h`, so pages pad clear of it and toasts sit above it. |
| `CartPanel` | One body shared by the desktop drawer and the phone page, so the two cannot drift. |

---

## 7. Interaction rules

These are enforced in code, not left to each screen:

1. **Quick-add never guesses.** `useQuickAdd` adds immediately only when a
   product needs no decision; when preparation or weight is mandatory it opens
   the customisation sheet instead.
2. **Nothing that costs money is preselected.** `defaultConfig` turns on only
   free, reversible, majority-choice extras. A required preparation is left
   deliberately unchosen, and the primary action stays disabled *with a stated
   reason* until it is made.
3. **Adding never navigates.** The item flies into the basket, a light
   confirmation offers Continue Shopping or View Basket, and the customer keeps
   their place.
4. **Controls appear only when useful.** Empty basket → no checkout controls.
   Returning customer → "Order again" leads. New customer → discovery leads.
   Unserved delivery area → the problem *and* the nearest alternatives.
5. **Honest numbers.** One pricing engine (`state/pricing.ts`) feeds the product
   page, the sheet, the basket and the order, so they cannot disagree. Yields
   are real: 1 kg of croaker filleted is shown as ≈ 520 g *before* purchase.
6. **No internal complexity leaks.** Order stages are written in customer
   language; procurement, suppliers and prep workflows stay in the admin view.

---

## 8. Review gates

The brief's review requirement is automated, in `tools/`:

```bash
npm run review:responsive   # 13 screens × 375/430/768/1024/1440
npm run review:contrast     # every text/background pair, light + dark
npm run review:glass        # rendered-pixel contrast on each glass surface
npm run review:flow         # drives a full purchase end to end
```

`review:responsive` fails a screen for horizontal overflow or for any
interactive target under 32×24 CSS px — and it understands hit areas extended
by a pseudo-element, so a small visual track with a large tap area passes
honestly. `review:contrast` composites backgrounds up the tree and skips
gradient subtrees it cannot resolve. `review:glass` screenshots each glass
surface and measures glyph-core versus local-surface luminance, so it sees what
the blur actually lets through.

Current state: responsive **all clean**, contrast **clean in both themes**,
glass **AA or better on every surface measured**, purchase flow **passes with
no console errors**.

Two bugs these gates caught that review by eye did not:

- `.page` animated `transform`, which made it the containing block for its
  `position: fixed` descendants — every sticky purchase bar was anchored to the
  page instead of the viewport. The page transition is now opacity-only.
- The desktop nav overflowed the viewport on **every** page between 768px and
  ~1100px. It now sheds the wide search field, then the button labels, by width.
