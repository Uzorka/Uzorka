import { useMemo, useState } from "react";
import { Badge, Price, Reveal } from "../components/Bits";
import { Button, IconButton } from "../components/Button";
import { AnimatedTotal, QuantitySelector } from "../components/Controls";
import { BackBar } from "../components/Nav";
import { ProductArt } from "../components/ProductArt";
import { Note, PreparationSelector, WeightSelector } from "../components/Selectors";
import { StickyBar } from "../components/StickyBar";
import { SectionHead } from "../components/Surface";
import { PREPS, productById } from "../data/catalog";
import { MEALS, mealBySlug } from "../data/meals";
import type { ExtraId, PrepId } from "../data/types";
import {
  IconBasket,
  IconBowl,
  IconChevronDown,
  IconClock,
  IconUser,
} from "../design/icons";
import { money, weight } from "../lib/format";
import { useIsMobile } from "../lib/hooks";
import { useNavigate } from "../lib/router";
import { unitPrice } from "../state/pricing";
import { useStore } from "../state/store";
import { NotFound } from "./NotFound";

/* ============================================================================
   Meals — discovery for customers who know the dish, not the shopping list.
   ========================================================================== */

export function Meals() {
  const nav = useNavigate();

  return (
    <div className="page">
      <header className="shophead">
        <p className="kicker">Start from dinner</p>
        <h1 className="shophead__title">Shop by meal</h1>
        <p className="shophead__sub">
          Pick the dish you want to cook. We work out what to buy, how much, and
          how it should be prepared — then you change whatever you like before it
          goes in the basket.
        </p>
      </header>

      <div className="mealgrid">
        {MEALS.map((m, i) => {
          const est = m.items.reduce((sum, it) => {
            const p = productById(it.productId);
            if (!p || it.optional) return sum;
            return sum + unitPrice(p, it.grams, it.prep, it.extras ?? []);
          }, 0);

          return (
            <Reveal key={m.id} delay={i * 40}>
              <button
                type="button"
                className="mealcard"
                onClick={() => nav(`/meals/${m.slug}`)}
              >
                <span className="mealcard__art">
                  <ProductArt hue={m.hue} motif={m.motif} variant="card" />
                  <span className="mealcard__tags">
                    {m.tags.slice(0, 1).map((t) => (
                      <Badge key={t} tone="glass" size="sm">
                        {t}
                      </Badge>
                    ))}
                  </span>
                </span>
                <span className="mealcard__body">
                  <span className="mealcard__name">{m.name}</span>
                  <span className="mealcard__tag">{m.tagline}</span>
                  <span className="mealcard__meta num">
                    <span>
                      <IconUser size={14} /> Serves {m.serves}
                    </span>
                    <span>
                      <IconClock size={14} /> {m.minutes} min
                    </span>
                  </span>
                  <span className="mealcard__foot">
                    <Price value={est} size="md" unit="estimated" />
                    <span className="mealcard__cta">Build this meal</span>
                  </span>
                </span>
              </button>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================================
   MealBuilder

   The recipe arrives pre-configured. Every line is editable — weight,
   preparation, quantity — and the estimated total updates as you change it.
   Optional items start switched off, because nothing that costs money is ever
   preselected without the customer choosing it.
   ========================================================================== */

type Draft = {
  on: boolean;
  grams: number;
  prep: PrepId | null;
  extras: ExtraId[];
  qty: number;
};

export function MealBuilder({ slug }: { slug?: string }) {
  const meal = slug ? mealBySlug(slug) : undefined;
  const nav = useNavigate();
  const isMobile = useIsMobile();
  const { dispatch, toast } = useStore();
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const [draft, setDraft] = useState<Record<string, Draft>>(() => {
    const d: Record<string, Draft> = {};
    (meal?.items ?? []).forEach((it) => {
      d[it.productId] = {
        on: !it.optional,
        grams: it.grams,
        prep: it.prep,
        extras: it.extras ?? [],
        qty: 1,
      };
    });
    return d;
  });

  const [servings, setServings] = useState(meal?.serves ?? 4);
  const scale = meal ? servings / meal.serves : 1;

  const lines = useMemo(() => {
    if (!meal) return [];
    return meal.items
      .map((it) => {
        const p = productById(it.productId);
        const d = draft[it.productId];
        if (!p || !d) return null;
        const grams = Math.round((d.grams * scale) / 50) * 50;
        return {
          item: it,
          product: p,
          draft: d,
          grams,
          price: unitPrice(p, grams, d.prep, d.extras) * d.qty,
        };
      })
      .filter(Boolean) as {
      item: (typeof meal.items)[number];
      product: NonNullable<ReturnType<typeof productById>>;
      draft: Draft;
      grams: number;
      price: number;
    }[];
  }, [meal, draft, scale]);

  const chosen = lines.filter((l) => l.draft.on);
  const total = chosen.reduce((s, l) => s + l.price, 0);
  const totalWeight = chosen.reduce((s, l) => s + l.grams * l.draft.qty, 0);

  if (!meal) return <NotFound />;

  const patch = (id: string, p: Partial<Draft>) =>
    setDraft((d) => ({ ...d, [id]: { ...d[id], ...p } }));

  const build = () => {
    setAdding(true);
    window.setTimeout(() => {
      chosen.forEach((l) => {
        dispatch({
          type: "cart/add",
          line: {
            productId: l.product.id,
            grams: l.grams,
            prep: l.draft.prep,
            extras: l.draft.extras,
            qty: l.draft.qty,
            source: { kind: "meal", label: meal.name },
          },
        });
      });
      setAdding(false);
      setAdded(true);
      toast({
        title: `${meal.name} added`,
        body: `${chosen.length} items · serves ${servings}`,
        tone: "ok",
        action: { label: "View basket", run: () => nav("/cart") },
      });
      window.setTimeout(() => setAdded(false), 1800);
    }, 300);
  };

  return (
    <div className="page">
      <BackBar label="Meals" to="/meals" />

      {/* --- Meal header --------------------------------------------------- */}
      <header className="mealhero">
        <div className="mealhero__art">
          <ProductArt hue={meal.hue} motif={meal.motif} variant="hero" />
        </div>
        <div className="mealhero__text">
          <p className="kicker">Meal</p>
          <h1 className="mealhero__title">{meal.name}</h1>
          <p className="mealhero__tag">{meal.tagline}</p>
          <p className="mealhero__about">{meal.about}</p>
          <div className="mealhero__chips">
            {meal.tags.map((t) => (
              <Badge key={t} tone="neutral" size="sm">
                {t}
              </Badge>
            ))}
            <Badge tone="info" size="sm">
              <IconClock size={12} /> {meal.minutes} min
            </Badge>
          </div>
        </div>
      </header>

      {/* --- Servings ------------------------------------------------------ */}
      <section className="mealserves card card--e1 card--pad-md">
        <div>
          <p className="mealserves__label">How many are you cooking for?</p>
          <p className="mealserves__note">
            Quantities scale with this — we round to the nearest 50 g.
          </p>
        </div>
        <QuantitySelector
          value={servings}
          min={1}
          max={20}
          size="lg"
          label="Number of servings"
          onChange={setServings}
        />
      </section>

      {/* --- Shopping list ------------------------------------------------- */}
      <SectionHead
        title="What goes in"
        sub="Change any weight or preparation. Turn off anything you already have."
      />

      <ul className="mealitems">
        {lines.map((l) => {
          const isOpen = open === l.product.id;
          return (
            <li
              key={l.product.id}
              className={`mitem ${l.draft.on ? "is-on" : "is-off"}`}
            >
              <div className="mitem__row">
                <button
                  type="button"
                  role="switch"
                  aria-checked={l.draft.on}
                  aria-label={`Include ${l.product.name}`}
                  className={`mitem__toggle ${l.draft.on ? "is-on" : ""}`}
                  onClick={() => patch(l.product.id, { on: !l.draft.on })}
                >
                  <span className="mitem__knob" />
                </button>

                <span className="mitem__art">
                  <ProductArt
                    hue={l.product.hue}
                    motif={l.product.motif}
                    variant="thumb"
                    dim={!l.draft.on}
                  />
                </span>

                <div className="mitem__text">
                  <p className="mitem__name">
                    {l.product.name}
                    {l.item.optional && (
                      <Badge tone="neutral" size="sm">
                        Optional
                      </Badge>
                    )}
                  </p>
                  <p className="mitem__why">{l.item.why}</p>
                  <p className="mitem__cfg num">
                    {weight(l.grams)}
                    {l.draft.prep ? ` · ${PREPS[l.draft.prep].label}` : ""}
                    {l.draft.qty > 1 ? ` · ×${l.draft.qty}` : ""}
                  </p>
                </div>

                <div className="mitem__right">
                  <span className="mitem__price num">{money(l.price)}</span>
                  <button
                    type="button"
                    className={`mitem__edit ${isOpen ? "is-open" : ""}`}
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : l.product.id)}
                  >
                    {isOpen ? "Done" : "Change"}
                    <IconChevronDown size={15} />
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="mitem__edit-panel">
                  <WeightSelector
                    product={l.product}
                    value={l.draft.grams}
                    onChange={(g) => patch(l.product.id, { grams: g })}
                    label={`Weight of ${l.product.name}`}
                  />
                  {l.product.preps.length > 0 && (
                    <PreparationSelector
                      product={l.product}
                      grams={l.grams}
                      value={l.draft.prep}
                      onChange={(p) => patch(l.product.id, { prep: p })}
                    />
                  )}
                  <div className="mitem__qty">
                    <span>Quantity</span>
                    <QuantitySelector
                      value={l.draft.qty}
                      size="sm"
                      onChange={(q) => patch(l.product.id, { qty: q })}
                      label={`Quantity of ${l.product.name}`}
                    />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {chosen.length === 0 && (
        <Note tone="warn">
          Everything is switched off. Turn at least one item back on to build this
          meal.
        </Note>
      )}

      {/* --- Summary ------------------------------------------------------- */}
      <div className="mealsum card card--e2 card--pad-lg">
        <div className="mealsum__facts">
          <div>
            <p className="mealsum__label">Serves</p>
            <p className="mealsum__value num">{servings}</p>
          </div>
          <div>
            <p className="mealsum__label">Items</p>
            <p className="mealsum__value num">{chosen.length}</p>
          </div>
          <div>
            <p className="mealsum__label">Total weight</p>
            <p className="mealsum__value num">{weight(totalWeight)}</p>
          </div>
          <div>
            <p className="mealsum__label">Estimated total</p>
            <p className="mealsum__value">
              <AnimatedTotal value={total} render={money} />
            </p>
          </div>
        </div>

        {!isMobile && (
          <Button
            variant="primary"
            size="lg"
            icon={<IconBasket size={19} />}
            disabled={chosen.length === 0}
            loading={adding}
            success={added}
            loadingLabel="Adding…"
            successLabel="Added to basket"
            onClick={build}
          >
            Build this meal · {money(total)}
          </Button>
        )}
      </div>

      {/* --- Other meals --------------------------------------------------- */}
      <Reveal>
        <SectionHead title="Other meals" />
        <div className="rail">
          {MEALS.filter((m) => m.id !== meal.id).map((m) => (
            <button
              key={m.id}
              type="button"
              className="mealtile"
              onClick={() => nav(`/meals/${m.slug}`)}
            >
              <span className="mealtile__art">
                <ProductArt hue={m.hue} motif={m.motif} variant="card" />
              </span>
              <span className="mealtile__over glass glass--ink">
                <span className="mealtile__name">{m.name}</span>
                <span className="mealtile__meta num">
                  Serves {m.serves} · {m.minutes} min
                </span>
              </span>
            </button>
          ))}
        </div>
      </Reveal>

      {isMobile && (
        <StickyBar>
          <div className="stickybuy__row">
            <div className="stickybuy__sum">
              <span className="stickybuy__cfg num">
                {chosen.length} items · serves {servings}
              </span>
              <AnimatedTotal value={total} render={money} className="stickybuy__total" />
            </div>
            <IconButton label="Back to meals" variant="soft" onClick={() => nav("/meals")}>
              <IconBowl size={19} />
            </IconButton>
          </div>
          <Button
            variant="primary"
            size="lg"
            block
            icon={<IconBasket size={19} />}
            disabled={chosen.length === 0}
            loading={adding}
            success={added}
            loadingLabel="Adding…"
            successLabel="Added to basket"
            onClick={build}
          >
            Build this meal
          </Button>
        </StickyBar>
      )}
    </div>
  );
}
