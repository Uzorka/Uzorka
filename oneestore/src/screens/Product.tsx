import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, FactRow, Price, Rating, Reveal } from "../components/Bits";
import { Button, IconButton } from "../components/Button";
import { AnimatedTotal, QuantitySelector } from "../components/Controls";
import { Adaptive } from "../components/Overlays";
import { ProductArt } from "../components/ProductArt";
import { ProductCard } from "../components/ProductCard";
import { BackBar } from "../components/Nav";
import {
  ExtrasSelector,
  Note,
  PreparationSelector,
  StepHeader,
  WeightSelector,
} from "../components/Selectors";
import { StickyBar } from "../components/StickyBar";
import { SectionHead } from "../components/Surface";
import {
  PREPS,
  PRODUCTS,
  availabilityLabel,
  categoryOf,
  productBySlug,
} from "../data/catalog";
import type { ExtraId, PrepId } from "../data/types";
import {
  IconBasket,
  IconChat,
  IconClock,
  IconHeart,
  IconKnife,
  IconPin,
  IconScale,
  IconSnow,
  IconVan,
} from "../design/icons";
import { money, weight } from "../lib/format";
import { useIsMobile } from "../lib/hooks";
import { useNavigate } from "../lib/router";
import { defaultConfig, preparedWeight, unitPrice } from "../state/pricing";
import { useAddToCart, useFavourite, useStore } from "../state/store";
import { NotFound } from "./NotFound";

/**
 * Product page.
 *
 * The hierarchy the brief asks for, made literal:
 *   primary    Add to basket  — filled, full width on mobile, sticky
 *   secondary  Save           — outlined icon button
 *   tertiary   Ask about this seafood — quiet text button
 *
 * Price, availability, weight, preparation and the prepared-weight estimate are
 * the prominent facts, because they are the five things a seafood customer
 * actually needs before deciding.
 */
export function ProductPage({ slug }: { slug?: string }) {
  const product = slug ? productBySlug(slug) : undefined;
  const nav = useNavigate();
  const isMobile = useIsMobile();
  const add = useAddToCart();
  const { state, toast } = useStore();
  const [fav, toggleFav] = useFavourite(product?.id ?? "");
  const [askOpen, setAskOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState(false);

  const remembered = product ? state.prefs.preps[product.id] : undefined;
  const [grams, setGrams] = useState(1000);
  const [prep, setPrep] = useState<PrepId | null>(null);
  const [extras, setExtras] = useState<ExtraId[]>([]);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const artRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!product) return;
    const cfg = defaultConfig(product, remembered);
    setGrams(cfg.grams);
    setPrep(cfg.prep);
    setExtras(cfg.extras);
    setQty(1);
    setAdded(false);
  }, [product, remembered]);

  const unit = useMemo(
    () => (product ? unitPrice(product, grams, prep, extras) : 0),
    [product, grams, prep, extras]
  );
  const prepared = preparedWeight(grams, prep, extras);
  const total = unit * qty;

  const related = useMemo(() => {
    if (!product) return [];
    return PRODUCTS.filter(
      (p) => p.category === product.category && p.id !== product.id
    ).slice(0, 4);
  }, [product]);

  if (!product) return <NotFound />;

  const cat = categoryOf(product.category);
  const avail = availabilityLabel(product);
  const out = product.availability === "out";
  const needsPrep = product.prepRequired && !prep;

  const commit = () => {
    if (needsPrep || out) return;
    setAdding(true);
    window.setTimeout(() => {
      add({ productId: product.id, grams, prep, extras, qty }, { confirm: true });
      setAdding(false);
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1600);
    }, 240);
  };

  return (
    <div className="page">
      <BackBar label={cat?.name ?? "Shop"} to={`/shop?c=${product.category}`} />

      <div className="pdp">
        {/* --- Media ------------------------------------------------------- */}
        <div className="pdp__media">
          <div className="pdp__art" ref={artRef}>
            <ProductArt
              hue={product.hue}
              motif={product.motif}
              variant="hero"
              dim={out}
            />
            <div className="pdp__artbadges">
              {product.badges?.map((b) => (
                <Badge key={b} tone="glass">
                  {b}
                </Badge>
              ))}
            </div>
          </div>

          {/* Provenance, on glass over the image edge — the detail that makes a
              seafood purchase feel trustworthy rather than anonymous. */}
          <div className="pdp__origin glass glass--floating">
            <IconPin size={16} />
            <div>
              <p className="pdp__originlabel">Where it is from</p>
              <p className="pdp__originvalue">{product.origin}</p>
            </div>
            <Badge tone={avail.tone} size="sm" dot={avail.tone === "ok"}>
              {avail.text}
            </Badge>
          </div>
        </div>

        {/* --- Buy panel ---------------------------------------------------- */}
        <div className="pdp__buy">
          <p className="kicker">{cat?.name}</p>
          <h1 className="pdp__name">{product.name}</h1>
          <p className="pdp__tag">{product.tagline}</p>

          <div className="pdp__ratingrow">
            <Rating value={product.rating} count={product.reviews} />
            {product.perKg && (
              <span className="pdp__perkg">{product.perKg}</span>
            )}
          </div>

          <div className="pdp__price">
            <Price value={product.pricePerKg} size="hero" unit="per kg raw" />
          </div>

          {/* The five facts, prominent and above the fold. */}
          <div className="pdp__facts">
            <FactRow
              items={[
                {
                  label: "Availability",
                  value: avail.text,
                  hint: out ? "Back tomorrow" : `Landed ${product.landedHoursAgo}h ago`,
                },
                {
                  label: "You are buying",
                  value: <span className="num">{weight(grams * qty)}</span>,
                  hint: "Raw weight",
                },
                {
                  label: "Prepared, est.",
                  value: (
                    <span className="num">
                      {prep ? `≈ ${weight(prepared * qty)}` : "Choose below"}
                    </span>
                  ),
                  hint: prep ? PREPS[prep].label : "Step 2",
                },
                {
                  label: "Delivery",
                  value: "Choose your day",
                  hint: "Across Lagos, from ₦2,500",
                },
              ]}
            />
          </div>

          {/* --- Customisation, inline on the page ------------------------- */}
          <section className="pdp__step">
            <StepHeader n={1} title="Choose weight" done hint={product.perKg} />
            <WeightSelector product={product} value={grams} onChange={setGrams} />
          </section>

          {product.preps.length > 0 && (
            <section className="pdp__step">
              <StepHeader
                n={2}
                title="How should we prepare it?"
                done={!product.prepRequired || !!prep}
                hint={product.prepRequired ? "Required" : "Optional"}
              />
              <PreparationSelector
                product={product}
                grams={grams}
                value={prep}
                onChange={setPrep}
                remembered={remembered}
              />
              {prep && prepared < grams * 0.97 && (
                <Note tone="info">
                  <strong className="num">{weight(grams)}</strong> raw becomes about{" "}
                  <strong className="num">{weight(prepared)}</strong> once{" "}
                  {PREPS[prep].label.toLowerCase()} — that is what lands on your
                  plate, and what we weigh in front of you.
                </Note>
              )}
            </section>
          )}

          {product.extras.length > 0 && (
            <section className="pdp__step">
              <StepHeader
                n={product.preps.length > 0 ? 3 : 2}
                title="Additional preferences"
                done
                hint="Optional"
              />
              <ExtrasSelector
                product={product}
                value={extras}
                onChange={setExtras}
                prep={prep}
              />
            </section>
          )}

          {/* --- Actions: one primary, one secondary, one tertiary --------- */}
          <div className="pdp__actions">
            <div className="pdp__qtyrow">
              <span className="pdp__qtylabel">Quantity</span>
              <QuantitySelector value={qty} onChange={setQty} size="md" />
            </div>

            {!isMobile && (
              <div className="pdp__buyrow">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<IconBasket size={19} />}
                  disabled={needsPrep || out}
                  loading={adding}
                  success={added}
                  loadingLabel="Adding…"
                  successLabel="Added to basket"
                  onClick={commit}
                  className="pdp__add"
                >
                  Add to basket · {money(total)}
                </Button>
                <IconButton
                  label={fav ? "Remove from saved" : "Save this"}
                  variant="soft"
                  size="lg"
                  active={fav}
                  className={fav ? "is-liked" : ""}
                  onClick={toggleFav}
                >
                  <IconHeart size={21} filled={fav} />
                </IconButton>
              </div>
            )}

            {needsPrep && (
              <Note tone="warn">
                Choose a preparation first. We will not guess how you want it cut —
                and it changes both the price and how much you get.
              </Note>
            )}
            {out && (
              <Note tone="bad">
                Sold out for today. New stock lands most mornings — save it and we
                will tell you when it is back.
              </Note>
            )}

            {!isMobile && (
              <button
                type="button"
                className="pdp__ask"
                onClick={() => setAskOpen(true)}
              >
                <IconChat size={16} /> Ask about this seafood
              </button>
            )}
          </div>

        </div>

          {/* --- About ------------------------------------------------------ */}
        <section className="pdp__about">
          <h2 className="pdp__abouth">About this seafood</h2>
          <p className="pdp__aboutbody">{product.about}</p>

          <ul className="pdp__care">
            <li>
              <IconSnow size={17} />
              <div>
                <p className="pdp__careh">Keeping it</p>
                <p className="pdp__carev">{product.storage}</p>
              </div>
            </li>
            <li>
              <IconKnife size={17} />
              <div>
                <p className="pdp__careh">Prepared by us</p>
                <p className="pdp__carev">
                  Cleaned, cut and portioned in our Lagos kitchen on the morning
                  of your delivery — never the night before.
                </p>
              </div>
            </li>
            <li>
              <IconVan size={17} />
              <div>
                <p className="pdp__careh">Getting to you</p>
                <p className="pdp__carev">
                  Packed on ice in a sealed box. Choose a two- or three-hour
                  window at checkout.
                </p>
              </div>
            </li>
            <li>
              <IconScale size={17} />
              <div>
                <p className="pdp__careh">What you pay for</p>
                <p className="pdp__carev">
                  Priced on raw weight. If the final weight comes in under what
                  you ordered, we refund the difference automatically.
                </p>
              </div>
            </li>
          </ul>
        </section>
      </div>

      {/* --- Related -------------------------------------------------------- */}
      {related.length > 0 && (
        <Reveal>
          <SectionHead
            kicker="Also in"
            title={cat?.name ?? "More seafood"}
            action={
              <Button variant="quiet" onClick={() => nav(`/shop?c=${product.category}`)}>
                See all
              </Button>
            }
          />
          <div className="pgrid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Reveal>
      )}

      {/* --- Mobile sticky purchase bar ------------------------------------ *
          The primary action stays in the thumb zone through the whole page, so
          the customer never scrolls back up to buy. */}
      {isMobile && (
        <StickyBar>
          <div className="stickybuy__row">
            <div className="stickybuy__sum">
              <span className="stickybuy__cfg num">
                {weight(grams)}
                {prep ? ` · ${PREPS[prep].label}` : ""}
              </span>
              <AnimatedTotal
                value={total}
                render={money}
                className="stickybuy__total"
              />
            </div>
            <IconButton
              label={fav ? "Remove from saved" : "Save this"}
              variant="soft"
              active={fav}
              className={fav ? "is-liked" : ""}
              onClick={toggleFav}
            >
              <IconHeart size={20} filled={fav} />
            </IconButton>
          </div>
          <Button
            variant="primary"
            size="lg"
            block
            icon={<IconBasket size={19} />}
            disabled={needsPrep || out}
            loading={adding}
            success={added}
            loadingLabel="Adding…"
            successLabel="Added to basket"
            onClick={commit}
          >
            {needsPrep ? "Choose a preparation" : out ? "Sold out today" : "Add to basket"}
          </Button>
          <button type="button" className="stickybuy__ask" onClick={() => setAskOpen(true)}>
            <IconChat size={15} /> Ask about this seafood
          </button>
        </StickyBar>
      )}

      {/* --- Ask about this seafood (tertiary action) ---------------------- */}
      <Adaptive
        open={askOpen}
        onClose={() => setAskOpen(false)}
        title={`Ask about ${product.name}`}
        width={460}
        footer={
          <Button
            variant="primary"
            size="lg"
            block
            disabled={question.trim().length < 3}
            success={asked}
            successLabel="Sent — we will reply shortly"
            onClick={() => {
              setAsked(true);
              window.setTimeout(() => {
                setAskOpen(false);
                setAsked(false);
                setQuestion("");
                toast({
                  title: "Question sent",
                  body: "We usually reply within the hour.",
                  tone: "ok",
                });
              }, 900);
            }}
          >
            Send question
          </Button>
        }
      >
        <p className="ask__intro">
          Ask us anything — size, how to cook it, whether it will suit a particular
          dish. A real person answers, usually within the hour.
        </p>
        <div className="ask__quick">
          {[
            "How many people will 1 kg feed?",
            "Is it good for the grill?",
            "Can you get me a bigger one?",
          ].map((s) => (
            <button
              key={s}
              type="button"
              className="chip"
              onClick={() => setQuestion(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <label className="ask__label" htmlFor="ask-field">
          Your question
        </label>
        <textarea
          id="ask-field"
          className="ask__field"
          rows={4}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question…"
          data-autofocus
        />
        <p className="ask__meta">
          <IconClock size={14} /> Typical reply time: under an hour, 8am–8pm
        </p>
      </Adaptive>
    </div>
  );
}
