import { productById } from "../data/catalog";
import { IconBasket, IconCheck, IconFish } from "../design/icons";
import { money, weight } from "../lib/format";
import { useIsMobile } from "../lib/hooks";
import { useNavigate } from "../lib/router";
import { useCartTotals, useStore } from "../state/store";
import { Button } from "./Button";
import { Adaptive } from "./Overlays";
import { ProductArt } from "./ProductArt";

/**
 * AddedSheet — the lightweight confirmation after a configured add.
 *
 * Adding something never navigates the customer away: this arrives over the page
 * they were on, states plainly what went in, and offers the two things they
 * might want next. It is small on purpose — the real work is already done.
 */
export function AddedSheet() {
  const { overlay, closeOverlay, openOverlay } = useStore();
  const { count, subtotal } = useCartTotals();
  const nav = useNavigate();
  const isMobile = useIsMobile();

  const open = overlay.kind === "added";
  const product = open ? productById(overlay.productId) : undefined;
  const grams = open && overlay.kind === "added" ? overlay.grams : 0;

  if (!product) return null;

  return (
    <Adaptive
      open={open}
      onClose={closeOverlay}
      srTitle="Added to your basket"
      width={420}
      className="added"
      handle={false}
    >
      <div className="added__body">
        <span className="added__tick" aria-hidden="true">
          <IconCheck size={26} />
        </span>
        <h2 className="added__title">Added to your basket</h2>

        <div className="added__item">
          <div className="added__art">
            <ProductArt hue={product.hue} motif={product.motif} variant="thumb" />
          </div>
          <div className="added__itemtext">
            <p className="added__name">{product.name}</p>
            <p className="added__cfg num">{weight(grams)}</p>
          </div>
        </div>

        <p className="added__sum">
          <span className="num">{count}</span> item{count === 1 ? "" : "s"} ·{" "}
          <strong className="num">{money(subtotal)}</strong>
        </p>

        <div className="added__actions">
          <Button
            variant="primary"
            size="lg"
            block
            icon={<IconBasket size={18} />}
            onClick={() => {
              closeOverlay();
              if (isMobile) nav("/cart");
              else openOverlay({ kind: "cart" });
            }}
          >
            View basket
          </Button>
          <Button
            variant="secondary"
            size="lg"
            block
            icon={<IconFish size={18} />}
            onClick={closeOverlay}
          >
            Continue shopping
          </Button>
        </div>
      </div>
    </Adaptive>
  );
}
