import { useCallback, useRef } from "react";
import {
  availabilityLabel,
  categoryOf,
  productById,
} from "../data/catalog";
import type { CartLine, Product } from "../data/types";
import { IconBasket, IconHeart, IconPlus, IconSpark } from "../design/icons";
import { flyTo } from "../design/motion";
import { money, weight } from "../lib/format";
import { useCanHover } from "../lib/hooks";
import { useNavigate } from "../lib/router";
import { defaultConfig, unitPrice } from "../state/pricing";
import { useAddToCart, useFavourite, useStore } from "../state/store";
import { Badge, Price, Rating } from "./Bits";
import { IconButton } from "./Button";
import { ProductArt } from "./ProductArt";

/* ============================================================================
   useQuickAdd — the one add-to-basket path shared by cards, meals and boxes.

   The rule the brief asks for, encoded once: if a product needs a decision, a
   quick-add must ask for it rather than silently inventing a configuration.
   Everything else adds straight away, flies into the basket, and confirms.
   ========================================================================== */

export function useQuickAdd() {
  const { openOverlay, state, cartAnchor } = useStore();
  const add = useAddToCart();

  return useCallback(
    (product: Product, origin?: HTMLElement | null) => {
      if (product.availability === "out") return;

      // A mandatory decision is never guessed — open the sheet instead.
      if (product.prepRequired) {
        openOverlay({ kind: "customize", productId: product.id });
        return;
      }

      const cfg = defaultConfig(product, state.prefs.preps[product.id]);
      const line: Omit<CartLine, "id"> = {
        productId: product.id,
        grams: cfg.grams,
        prep: cfg.prep,
        extras: cfg.extras,
        qty: 1,
      };

      // Fly a ghost of the tile into the basket button, then commit the line.
      const target = cartAnchor.current;
      if (origin && target) {
        const from = origin.getBoundingClientRect();
        const to = target.getBoundingClientRect();
        const ghost = origin.cloneNode(true) as HTMLElement;
        ghost.className = "flyghost";
        ghost.style.left = `${from.left}px`;
        ghost.style.top = `${from.top}px`;
        ghost.style.width = `${from.width}px`;
        ghost.style.height = `${from.height}px`;
        document.body.appendChild(ghost);
        flyTo(ghost, from, to, () => ghost.remove());
      }

      add(line);
    },
    [openOverlay, add, state.prefs.preps, cartAnchor]
  );
}

/* ============================================================================
   ProductCard

   Deliberately spare: image, name, price, unit, availability. Anything else
   competes with the next card. Secondary actions (save) appear on hover where a
   pointer exists, and are permanently visible on touch, where hover does not.
   ========================================================================== */

export function ProductCard({
  product,
  layout = "grid",
  showCategory,
}: {
  product: Product;
  layout?: "grid" | "rail" | "row";
  showCategory?: boolean;
}) {
  const nav = useNavigate();
  const quickAdd = useQuickAdd();
  const canHover = useCanHover();
  const [fav, toggleFav] = useFavourite(product.id);
  const artRef = useRef<HTMLDivElement>(null);
  const avail = availabilityLabel(product);
  const cat = categoryOf(product.category);
  const out = product.availability === "out";
  const soon = product.availability === "preorder";

  const go = () => nav(`/p/${product.slug}`);

  return (
    <article
      className={`pcard pcard--${layout} ${out ? "is-out" : ""}`}
      aria-labelledby={`pc-${product.id}`}
    >
      <button
        type="button"
        className="pcard__hit"
        onClick={go}
        aria-label={`${product.name}, ${money(product.pricePerKg)} per kg. View details`}
      />

      <div className="pcard__media" ref={artRef}>
        <ProductArt
          hue={product.hue}
          motif={product.motif}
          variant={layout === "row" ? "thumb" : "card"}
          dim={out}
        />

        <div className="pcard__badges">
          {product.badges?.slice(0, 1).map((b) => (
            <Badge key={b} tone={b === "Chef pick" ? "sand" : "glass"} size="sm">
              {b === "Chef pick" ? <IconSpark size={12} /> : null}
              {b}
            </Badge>
          ))}
        </div>

        {/* Save sits on the image, above the card's own tap target. */}
        <div className={`pcard__fav ${canHover ? "is-hoverable" : "is-always"}`}>
          <IconButton
            label={fav ? `Remove ${product.name} from saved` : `Save ${product.name}`}
            variant="glass"
            size="sm"
            active={fav}
            className={fav ? "is-liked" : ""}
            onClick={(e) => {
              e.stopPropagation();
              toggleFav();
            }}
          >
            <IconHeart size={17} filled={fav} />
          </IconButton>
        </div>

        {/* Quick add. On hover-capable devices it slides up on hover; on touch it
            is always present, because there is no hover to discover it with. */}
        {!out && (
          <div className={`pcard__quick ${canHover ? "is-hoverable" : "is-always"}`}>
            <button
              type="button"
              className="qadd"
              onClick={(e) => {
                e.stopPropagation();
                quickAdd(product, artRef.current);
              }}
            >
              {product.prepRequired ? (
                <>
                  <IconBasket size={16} />
                  <span>Choose options</span>
                </>
              ) : (
                <>
                  <IconPlus size={16} />
                  <span>Quick add</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="pcard__body">
        {showCategory && cat && <p className="pcard__cat">{cat.short}</p>}
        <h3 className="pcard__name" id={`pc-${product.id}`}>
          {product.name}
        </h3>
        {layout === "row" && <p className="pcard__tag">{product.tagline}</p>}

        <div className="pcard__pricing">
          <Price value={product.pricePerKg} size="md" unit="per kg" />
        </div>

        <div className="pcard__meta">
          <Badge tone={avail.tone} size="sm" dot={avail.tone === "ok"}>
            {avail.text}
          </Badge>
          {layout === "row" && <Rating value={product.rating} count={product.reviews} />}
        </div>

        {soon && (
          <p className="pcard__note">Delivered on the next landing — we will confirm the day.</p>
        )}
      </div>
    </article>
  );
}

/* ============================================================================
   CompactLine — a product as it appears inside the basket, an order or a meal.
   ========================================================================== */

export function LineThumb({ productId }: { productId: string }) {
  const p = productById(productId);
  if (!p) return null;
  return (
    <div className="linethumb">
      <ProductArt hue={p.hue} motif={p.motif} variant="thumb" />
    </div>
  );
}

/** The one-line description of a configured line: "1 kg · Filleted · Skin off". */
export function LineConfig({ line }: { line: CartLine }) {
  const p = productById(line.productId);
  if (!p) return null;
  return (
    <p className="lineconfig num">
      {weight(line.grams)}
      {line.prep && <span> · {prepLabel(line.prep)}</span>}
      {line.extras.length > 0 && <span> · {line.extras.length} extra{line.extras.length > 1 ? "s" : ""}</span>}
    </p>
  );
}

function prepLabel(id: string): string {
  return (
    {
      whole: "Whole",
      gutted: "Gutted",
      cleaned: "Cleaned",
      filleted: "Filleted",
      steak: "Steak cut",
      butterflied: "Butterflied",
      "shell-on": "Shell on",
      peeled: "Peeled",
      "peeled-deveined": "Peeled & deveined",
      cracked: "Cracked",
      rings: "Rings",
      flaked: "Flaked",
    }[id] ?? id
  );
}

/** Unit price for a configured line, used in the basket. */
export function lineUnitLabel(line: CartLine): string {
  const p = productById(line.productId);
  if (!p) return "";
  return money(unitPrice(p, line.grams, line.prep, line.extras));
}
