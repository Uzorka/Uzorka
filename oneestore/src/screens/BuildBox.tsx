import { useMemo, useRef, useState } from "react";
import { Badge, EmptyState, Price, ProgressBar, Reveal } from "../components/Bits";
import { Button, IconButton } from "../components/Button";
import { AnimatedTotal, SegmentedControl } from "../components/Controls";
import { ProductArt } from "../components/ProductArt";
import { Note } from "../components/Selectors";
import { StickyBar } from "../components/StickyBar";
import { SectionHead } from "../components/Surface";
import { CATEGORIES, PRODUCTS, productById } from "../data/catalog";
import type { Product } from "../data/types";
import {
  IconBasket,
  IconBox,
  IconCheck,
  IconMinus,
  IconPlus,
  IconSpark,
  IconTrash,
} from "../design/icons";
import { money, weight } from "../lib/format";
import { useIsMobile } from "../lib/hooks";
import { useNavigate } from "../lib/router";
import { defaultConfig } from "../state/pricing";
import { useStore } from "../state/store";

/* ============================================================================
   Build Your Box

   ONEESTORE's signature interaction. The box is drawn, not described: as items
   go in, tiles spring into the box, the fill bar advances, the weight and total
   count up, and the box says how close it is to the size you chose.

   Everything is operable by tapping — the drag is an optional accelerator on
   pointer devices, never the only route. That is the rule the brief sets and it
   is also the only way this works on a phone.
   ========================================================================== */

const BOX_SIZES = {
  small: { label: "Small", grams: 2000, serves: "2–3 people", discount: 0 },
  medium: { label: "Medium", grams: 4000, serves: "4–6 people", discount: 0.03 },
  large: { label: "Large", grams: 6000, serves: "8–10 people", discount: 0.06 },
} as const;

type SizeId = keyof typeof BOX_SIZES;

export function BuildBox() {
  const { state, dispatch, toast, cartAnchor } = useStore();
  const nav = useNavigate();
  const isMobile = useIsMobile();
  const [cat, setCat] = useState<string>("");
  const [dragging, setDragging] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const size = BOX_SIZES[state.boxSize as SizeId];
  const entries = Object.entries(state.box);

  const { grams, subtotal, lines } = useMemo(() => {
    let g = 0;
    let s = 0;
    const l = entries
      .map(([id, gr]) => {
        const p = productById(id);
        if (!p) return null;
        g += gr;
        s += (p.pricePerKg * gr) / 1000;
        return { product: p, grams: gr };
      })
      .filter(Boolean) as { product: Product; grams: number }[];
    return { grams: g, subtotal: Math.round(s), lines: l };
  }, [entries]);

  const discount = Math.round(subtotal * size.discount);
  const total = subtotal - discount;
  const pct = Math.min(100, (grams / size.grams) * 100);
  const full = grams >= size.grams;
  const over = grams > size.grams;

  const shown = useMemo(
    () =>
      (cat ? PRODUCTS.filter((p) => p.category === cat) : PRODUCTS)
        .filter((p) => p.availability !== "out")
        .sort((a, b) => b.popularity - a.popularity),
    [cat]
  );

  const step = (p: Product, delta: number) => {
    const current = state.box[p.id] ?? 0;
    const next = current + delta;
    if (next <= 0) dispatch({ type: "box/remove", productId: p.id });
    else dispatch({ type: "box/set", productId: p.id, grams: Math.min(5000, next) });
  };

  /* --- Drag: pointer-based, so it works with a mouse and a stylus. Touch keeps
         the tap controls, which are always present anyway. ----------------- */
  const onDragStart = (p: Product) => (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return; // touch scrolls; tapping adds
    setDragging(p.id);
    const move = (ev: PointerEvent) => {
      const box = boxRef.current?.getBoundingClientRect();
      if (!box) return;
      const inside =
        ev.clientX >= box.left &&
        ev.clientX <= box.right &&
        ev.clientY >= box.top &&
        ev.clientY <= box.bottom;
      boxRef.current?.classList.toggle("is-target", inside);
    };
    const up = (ev: PointerEvent) => {
      const box = boxRef.current?.getBoundingClientRect();
      if (
        box &&
        ev.clientX >= box.left &&
        ev.clientX <= box.right &&
        ev.clientY >= box.top &&
        ev.clientY <= box.bottom
      ) {
        step(p, 500);
      }
      boxRef.current?.classList.remove("is-target");
      setDragging(null);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const addBoxToBasket = () => {
    lines.forEach(({ product, grams: g }) => {
      const cfg = defaultConfig(product, state.prefs.preps[product.id]);
      dispatch({
        type: "cart/add",
        line: {
          productId: product.id,
          grams: g,
          prep: cfg.prep,
          extras: cfg.extras,
          qty: 1,
          source: { kind: "box", label: `${size.label} box` },
        },
      });
    });
    dispatch({ type: "box/clear" });
    toast({
      title: "Your box is in the basket",
      body: `${lines.length} items · ${weight(grams)}`,
      tone: "ok",
      action: { label: "View basket", run: () => nav("/cart") },
    });
    const anchor = cartAnchor.current;
    anchor?.animate?.(
      [{ transform: "scale(1)" }, { transform: "scale(1.3)" }, { transform: "scale(1)" }],
      { duration: 460, easing: "cubic-bezier(.34,1.46,.64,1)" }
    );
  };

  return (
    <div className="page">
      <header className="boxhead">
        <p className="kicker">Signature</p>
        <h1 className="boxhead__title">Build your box</h1>
        <p className="boxhead__sub">
          Mix any seafood you like, pay by weight, and get it all cleaned and
          packed together. Pick a box size, then add until it is full.
        </p>
      </header>

      <div className="boxlayout">
        {/* --- The box itself ---------------------------------------------- */}
        <div className="boxpanel">
          <div
            ref={boxRef}
            className={`boxviz ${full ? "is-full" : ""} ${dragging ? "is-dropzone" : ""}`}
          >
            <div className="boxviz__lid" aria-hidden="true" />
            <div className="boxviz__inner">
              {lines.length === 0 ? (
                <p className="boxviz__empty">
                  <IconBox size={26} />
                  <span>Your box is empty. Add seafood from the right.</span>
                </p>
              ) : (
                <ul className="boxviz__tiles">
                  {lines.map(({ product, grams: g }) => (
                    <li key={product.id} className="boxtile">
                      <span className="boxtile__art">
                        <ProductArt
                          hue={product.hue}
                          motif={product.motif}
                          variant="thumb"
                        />
                      </span>
                      <span className="boxtile__w num">{weight(g)}</span>
                      <button
                        type="button"
                        className="boxtile__x"
                        aria-label={`Remove ${product.name} from your box`}
                        onClick={() => dispatch({ type: "box/remove", productId: product.id })}
                      >
                        <IconTrash size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* The water line: the fill is the progress indicator. */}
            <div
              className="boxviz__fill"
              style={{ height: `${pct}%` }}
              aria-hidden="true"
            />
          </div>

          <div className="boxstatus">
            <SegmentedControl
              label="Box size"
              block
              value={state.boxSize as SizeId}
              onChange={(v) => dispatch({ type: "box/size", size: v })}
              items={(Object.keys(BOX_SIZES) as SizeId[]).map((k) => ({
                value: k,
                label: BOX_SIZES[k].label,
              }))}
            />

            <div className="boxstatus__bar">
              <div className="boxstatus__barhead">
                <span className="num">
                  {weight(grams)} <span className="boxstatus__of">of {weight(size.grams)}</span>
                </span>
                {full && (
                  <Badge tone="ok" size="sm">
                    <IconCheck size={12} /> {over ? "Over full" : "Full"}
                  </Badge>
                )}
              </div>
              <ProgressBar
                value={grams}
                max={size.grams}
                tone={full ? "ok" : "brand"}
                label="Box fill"
                height={10}
              />
              <p className="boxstatus__hint">
                {full
                  ? `Feeds ${size.serves}. Add more if you like — there is no hard limit.`
                  : `${weight(Math.max(0, size.grams - grams))} to go. A ${size.label.toLowerCase()} box feeds ${size.serves}.`}
              </p>
            </div>

            <dl className="boxsum">
              <div>
                <dt>Items</dt>
                <dd className="num">{lines.length}</dd>
              </div>
              <div>
                <dt>Weight</dt>
                <dd className="num">{weight(grams)}</dd>
              </div>
              <div>
                <dt>Subtotal</dt>
                <dd>
                  <AnimatedTotal value={subtotal} render={money} />
                </dd>
              </div>
              {discount > 0 && (
                <div className="boxsum__save">
                  <dt>
                    {size.label} box saving
                    <Badge tone="ok" size="sm">
                      {Math.round(size.discount * 100)}%
                    </Badge>
                  </dt>
                  <dd className="num">−{money(discount)}</dd>
                </div>
              )}
              <div className="boxsum__total">
                <dt>Total</dt>
                <dd>
                  <AnimatedTotal value={total} render={money} />
                </dd>
              </div>
            </dl>

            {lines.length > 0 && (
              <Note tone="info">
                Everything in your box is cleaned as standard. You can change the
                preparation of any item in your basket before checkout.
              </Note>
            )}

            {!isMobile && (
              <div className="boxstatus__actions">
                <Button
                  variant="primary"
                  size="lg"
                  block
                  icon={<IconBasket size={19} />}
                  disabled={lines.length === 0}
                  onClick={addBoxToBasket}
                >
                  Add box to basket · {money(total)}
                </Button>
                {lines.length > 0 && (
                  <Button
                    variant="quiet"
                    block
                    onClick={() => dispatch({ type: "box/clear" })}
                  >
                    Empty the box
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* --- The picker --------------------------------------------------- */}
        <div className="boxpicker">
          <SectionHead
            title="Add to your box"
            sub={
              isMobile
                ? "Tap + to add 500 g at a time."
                : "Tap + to add 500 g, or drag an item into the box."
            }
          />

          <div className="rail boxpicker__cats">
            <button
              type="button"
              className={`chip ${!cat ? "is-selected" : ""}`}
              onClick={() => setCat("")}
            >
              Everything
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`chip ${cat === c.id ? "is-selected" : ""}`}
                onClick={() => setCat(cat === c.id ? "" : c.id)}
              >
                {c.short}
              </button>
            ))}
          </div>

          {shown.length === 0 ? (
            <EmptyState
              compact
              title="Nothing here today"
              body="This category has sold out. Try another — new stock lands most mornings."
            />
          ) : (
            <ul className="boxgrid">
              {shown.map((p) => {
                const inBox = state.box[p.id] ?? 0;
                return (
                  <li
                    key={p.id}
                    className={`bitem ${inBox ? "is-in" : ""} ${
                      dragging === p.id ? "is-dragging" : ""
                    }`}
                  >
                    <span
                      className="bitem__art"
                      onPointerDown={onDragStart(p)}
                      role="presentation"
                    >
                      <ProductArt hue={p.hue} motif={p.motif} variant="thumb" />
                      {inBox > 0 && (
                        <span className="bitem__flag num" aria-hidden="true">
                          {weight(inBox)}
                        </span>
                      )}
                    </span>

                    <span className="bitem__text">
                      <span className="bitem__name">{p.name}</span>
                      <Price value={p.pricePerKg} size="sm" unit="/kg" tone="quiet" />
                    </span>

                    <span className="bitem__ctrl">
                      {inBox > 0 && (
                        <IconButton
                          label={`Remove 500 g of ${p.name}`}
                          variant="soft"
                          size="sm"
                          onClick={() => step(p, -500)}
                        >
                          <IconMinus size={15} />
                        </IconButton>
                      )}
                      <IconButton
                        label={`Add 500 g of ${p.name} to your box`}
                        variant={inBox ? "soft" : "solid"}
                        size="sm"
                        onClick={() => step(p, 500)}
                      >
                        <IconPlus size={15} />
                      </IconButton>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          <Reveal>
            <div className="boxtip card card--e1 card--pad-md">
              <IconSpark size={18} />
              <p>
                <strong>A good box</strong> mixes one fish, one shellfish and
                something smoked — it covers stew, grill and soup for a week.
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* --- Mobile sticky action ------------------------------------------ */}
      {isMobile && lines.length > 0 && (
        <StickyBar>
          <div className="stickybuy__row">
            <div className="stickybuy__sum">
              <span className="stickybuy__cfg num">
                {lines.length} items · {weight(grams)}
              </span>
              <AnimatedTotal value={total} render={money} className="stickybuy__total" />
            </div>
            <IconButton
              label="Empty the box"
              variant="soft"
              onClick={() => dispatch({ type: "box/clear" })}
            >
              <IconTrash size={18} />
            </IconButton>
          </div>
          <Button
            variant="primary"
            size="lg"
            block
            icon={<IconBasket size={19} />}
            onClick={addBoxToBasket}
          >
            Add box to basket
          </Button>
        </StickyBar>
      )}
    </div>
  );
}
