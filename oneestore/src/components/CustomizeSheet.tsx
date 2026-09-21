import { useEffect, useMemo, useState } from "react";
import { PREPS, productById } from "../data/catalog";
import type { ExtraId, PrepId } from "../data/types";
import { IconBasket, IconScale, IconKnife, IconSpark } from "../design/icons";
import { money, weight } from "../lib/format";
import {
  defaultConfig,
  preparedWeight,
  unitPrice,
} from "../state/pricing";
import { useAddToCart, useStore } from "../state/store";
import { Badge } from "./Bits";
import { Button } from "./Button";
import { AnimatedTotal, QuantitySelector } from "./Controls";
import { Adaptive } from "./Overlays";
import { ProductArt } from "./ProductArt";
import {
  ExtrasSelector,
  Note,
  PreparationSelector,
  StepHeader,
  WeightSelector,
} from "./Selectors";

/**
 * CustomizeSheet — the progressive, visual alternative to a long form.
 *
 * Three numbered steps: weight, preparation, preferences. Nothing is a dropdown,
 * nothing is a text field, and the running total, prepared-weight estimate and
 * summary update on every tap. The Add button stays pinned in the footer, so the
 * customer can commit at any point without scrolling back.
 *
 * This is also where a quick-add lands when a product needs a real decision —
 * which is why the primary action stays disabled, with a reason, until the
 * required preparation is chosen.
 */
export function CustomizeSheet() {
  const { overlay, closeOverlay, state, dispatch } = useStore();
  const add = useAddToCart();

  const open = overlay.kind === "customize";
  const productId = open ? overlay.productId : null;
  const lineId = open && overlay.kind === "customize" ? overlay.lineId : undefined;
  const product = productId ? productById(productId) : undefined;
  const editing = lineId ? state.cart.find((l) => l.id === lineId) : undefined;

  const remembered = product ? state.prefs.preps[product.id] : undefined;

  const [grams, setGrams] = useState(1000);
  const [prep, setPrep] = useState<PrepId | null>(null);
  const [extras, setExtras] = useState<ExtraId[]>([]);
  const [qty, setQty] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Reset to the right starting point each time the sheet opens: the line being
  // edited, or the customer's remembered preference, or a safe default.
  useEffect(() => {
    if (!open || !product) return;
    if (editing) {
      setGrams(editing.grams);
      setPrep(editing.prep);
      setExtras(editing.extras);
      setQty(editing.qty);
    } else {
      const cfg = defaultConfig(product, remembered);
      setGrams(cfg.grams);
      setPrep(cfg.prep);
      setExtras(cfg.extras);
      setQty(1);
    }
    setSaving(false);
    setSaved(false);
  }, [open, product, editing, remembered]);

  const unit = useMemo(
    () => (product ? unitPrice(product, grams, prep, extras) : 0),
    [product, grams, prep, extras]
  );
  const prepared = preparedWeight(grams, prep, extras);
  const total = unit * qty;

  if (!product) return null;

  const needsPrep = product.prepRequired && !prep;
  const prepStepDone = !product.prepRequired || !!prep;

  const commit = () => {
    if (needsPrep) return;
    setSaving(true);
    // A short, honest pause: the button shows it is working, then confirms, so a
    // tap never leaves the customer wondering whether anything happened.
    window.setTimeout(() => {
      if (editing) {
        dispatch({
          type: "cart/update",
          id: editing.id,
          patch: { grams, prep, extras, qty },
        });
      } else {
        add({ productId: product.id, grams, prep, extras, qty }, { confirm: true });
      }
      setSaving(false);
      setSaved(true);
      window.setTimeout(closeOverlay, 420);
    }, 260);
  };

  return (
    <Adaptive
      open={open}
      onClose={closeOverlay}
      desktop="dialog"
      width={560}
      srTitle={`Customise ${product.name}`}
      className="cust"
      footer={
        <div className="cust__foot">
          <div className="cust__footsum">
            <span className="cust__footlabel">
              {qty > 1 ? `${qty} × ${weight(grams)}` : weight(grams)}
              {prep ? ` · ${PREPS[prep].label}` : ""}
            </span>
            <AnimatedTotal
              value={total}
              render={money}
              className="cust__foottotal"
            />
          </div>
          <Button
            variant="primary"
            size="lg"
            block
            icon={<IconBasket size={19} />}
            disabled={needsPrep}
            loading={saving}
            success={saved}
            loadingLabel="Adding…"
            successLabel={editing ? "Updated" : "Added"}
            onClick={commit}
          >
            {editing ? "Update basket" : `Add to basket · ${money(total)}`}
          </Button>
          {needsPrep && (
            <p className="cust__blocked" role="status">
              Choose a preparation in step 2 first — we will not guess how you want
              it cut.
            </p>
          )}
        </div>
      }
    >
      {/* --- Product header ------------------------------------------------- */}
      <div className="cust__head">
        <div className="cust__art">
          <ProductArt hue={product.hue} motif={product.motif} variant="thumb" />
        </div>
        <div className="cust__headtext">
          <h2 className="cust__name">{product.name}</h2>
          <p className="cust__tag">{product.tagline}</p>
          <p className="cust__rate num">
            {money(product.pricePerKg)} <span>per kg</span>
          </p>
        </div>
      </div>

      {/* --- Step 1: weight ------------------------------------------------- */}
      <section className="cust__step">
        <StepHeader
          n={1}
          title="Choose weight"
          done
          hint={product.perKg}
        />
        <WeightSelector product={product} value={grams} onChange={setGrams} />
      </section>

      {/* --- Step 2: preparation -------------------------------------------- */}
      {product.preps.length > 0 && (
        <section className="cust__step">
          <StepHeader
            n={2}
            title="How should we prepare it?"
            done={prepStepDone}
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
              {PREPS[prep].label.toLowerCase()} — that is the seafood you will
              actually cook.
            </Note>
          )}
        </section>
      )}

      {/* --- Step 3: preferences -------------------------------------------- */}
      {product.extras.length > 0 && (
        <section className="cust__step">
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

      {/* --- Live summary --------------------------------------------------- */}
      <section className="cust__summary">
        <div className="cust__sumrow">
          <span className="cust__sumlabel">
            <IconScale size={16} /> Raw weight
          </span>
          <span className="num">{weight(grams * qty)}</span>
        </div>
        {prepared < grams * 0.97 && (
          <div className="cust__sumrow">
            <span className="cust__sumlabel">
              <IconKnife size={16} /> Prepared, estimated
            </span>
            <span className="num">≈ {weight(prepared * qty)}</span>
          </div>
        )}
        <div className="cust__sumrow">
          <span className="cust__sumlabel">Quantity</span>
          <QuantitySelector value={qty} onChange={setQty} size="sm" />
        </div>
        <div className="cust__sumrow cust__sumrow--total">
          <span className="cust__sumlabel">Total</span>
          <AnimatedTotal value={total} render={money} />
        </div>
        {product.availability === "preorder" && (
          <Note tone="warn">
            This is a pre-order. We will confirm your delivery day as soon as the
            next landing is scheduled, and you are not charged until then.
          </Note>
        )}
        {product.availability === "limited" && (
          <Note tone="warn">
            Only {product.stockKg} kg left today. If it sells out we will call you
            before substituting anything.
          </Note>
        )}
      </section>

      <p className="cust__storage">
        <Badge tone="glass" size="sm">
          <IconSpark size={12} /> Keeping it
        </Badge>
        {product.storage}
      </p>
    </Adaptive>
  );
}
