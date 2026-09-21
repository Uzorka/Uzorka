import { productById } from "../data/catalog";
import type { CartLine } from "../data/types";
import {
  IconBasket,
  IconChevronRight,
  IconFish,
  IconTrash,
  IconVan,
} from "../design/icons";
import { money, weight } from "../lib/format";
import { useNavigate } from "../lib/router";
import {
  FREE_DELIVERY_OVER,
  linePrice,
  preparedWeight,
} from "../state/pricing";
import { useCartTotals, useStore } from "../state/store";
import { Badge, EmptyState, ProgressBar } from "./Bits";
import { Button, IconButton } from "./Button";
import { AnimatedTotal, QuantitySelector } from "./Controls";
import { Drawer } from "./Overlays";
import { LineConfig, LineThumb } from "./ProductCard";

/* ============================================================================
   CartLineRow — shared by the drawer, the phone basket page and checkout review.
   Editing a line reopens the customisation sheet rather than showing a second,
   inferior set of controls.
   ========================================================================== */

export function CartLineRow({
  line,
  compact,
  readOnly,
}: {
  line: CartLine;
  compact?: boolean;
  readOnly?: boolean;
}) {
  const { dispatch, openOverlay, toast } = useStore();
  const p = productById(line.productId);
  if (!p) return null;

  const prepared = preparedWeight(line.grams, line.prep, line.extras) * line.qty;
  const showPrepared = prepared < line.grams * line.qty * 0.97;

  return (
    <li className={`cline ${compact ? "cline--compact" : ""}`}>
      <LineThumb productId={line.productId} />

      <div className="cline__text">
        <div className="cline__top">
          <h3 className="cline__name">{p.name}</h3>
          <span className="cline__price num">{money(linePrice(line))}</span>
        </div>

        <LineConfig line={line} />

        {showPrepared && (
          <p className="cline__yield num">≈ {weight(prepared)} prepared</p>
        )}

        {line.source && (
          <Badge tone="glass" size="sm">
            {line.source.label}
          </Badge>
        )}

        {!readOnly && (
          <div className="cline__actions">
            <QuantitySelector
              value={line.qty}
              min={1}
              size="sm"
              onChange={(qty) => dispatch({ type: "cart/qty", id: line.id, qty })}
              label={`Quantity of ${p.name}`}
            />
            <button
              type="button"
              className="cline__edit"
              onClick={() =>
                openOverlay({ kind: "customize", productId: p.id, lineId: line.id })
              }
            >
              Edit
            </button>
            <IconButton
              label={`Remove ${p.name}`}
              variant="plain"
              size="sm"
              onClick={() => {
                const removed = line;
                dispatch({ type: "cart/remove", id: line.id });
                toast({
                  title: "Removed",
                  body: p.name,
                  tone: "info",
                  action: {
                    label: "Undo",
                    run: () =>
                      dispatch({
                        type: "cart/add",
                        line: {
                          productId: removed.productId,
                          grams: removed.grams,
                          prep: removed.prep,
                          extras: removed.extras,
                          qty: removed.qty,
                          source: removed.source,
                        },
                      }),
                  },
                });
              }}
            >
              <IconTrash size={16} />
            </IconButton>
          </div>
        )}
      </div>
    </li>
  );
}

/* ============================================================================
   Free-delivery nudge. Stated as progress, not as a pop-up.
   ========================================================================== */

export function DeliveryProgress({ subtotal }: { subtotal: number }) {
  const left = FREE_DELIVERY_OVER - subtotal;
  const done = left <= 0;
  return (
    <div className={`freedel ${done ? "is-done" : ""}`}>
      <div className="freedel__top">
        <IconVan size={17} />
        <span>
          {done ? (
            <strong>Delivery is on us</strong>
          ) : (
            <>
              <strong className="num">{money(left)}</strong> more for free delivery
            </>
          )}
        </span>
      </div>
      <ProgressBar
        value={Math.min(subtotal, FREE_DELIVERY_OVER)}
        max={FREE_DELIVERY_OVER}
        tone={done ? "ok" : "brand"}
        height={6}
        label="Progress towards free delivery"
      />
    </div>
  );
}

/* ============================================================================
   CartBody — the list plus the summary. Reused by the drawer and the phone page
   so the basket is one implementation, not two that drift.
   ========================================================================== */

export function CartBody({
  onNavigate,
  /** The drawer shows the subtotal in its pinned footer, so the body omits it
   *  rather than printing the same figure twice on one screen. */
  showSubtotal = true,
}: {
  onNavigate?: () => void;
  showSubtotal?: boolean;
}) {
  const { state } = useStore();
  const { subtotal, grams } = useCartTotals();
  const nav = useNavigate();

  if (state.cart.length === 0) {
    return (
      <EmptyState
        icon={<IconBasket size={30} />}
        title="Your basket is empty"
        body="Fresh seafood is waiting. Have a look at what came in today."
        action={
          <Button
            variant="primary"
            icon={<IconFish size={18} />}
            onClick={() => {
              onNavigate?.();
              nav("/shop");
            }}
          >
            Browse seafood
          </Button>
        }
        secondary={
          <Button
            variant="quiet"
            onClick={() => {
              onNavigate?.();
              nav("/meals");
            }}
          >
            Shop by meal
          </Button>
        }
      />
    );
  }

  return (
    <>
      <DeliveryProgress subtotal={subtotal} />
      <ul className="clines">
        {state.cart.map((l) => (
          <CartLineRow key={l.id} line={l} />
        ))}
      </ul>
      <div className="cartsum">
        {showSubtotal && (
          <div className="cartsum__row">
            <span>Subtotal</span>
            <AnimatedTotal value={subtotal} render={money} />
          </div>
        )}
        <div className="cartsum__row cartsum__row--quiet">
          <span>Total weight</span>
          <span className="num">{weight(grams)}</span>
        </div>
        <div className="cartsum__row cartsum__row--quiet">
          <span>Delivery</span>
          <span className="num">
            {subtotal >= FREE_DELIVERY_OVER ? "Free" : "From ₦2,500"}
          </span>
        </div>
        <p className="cartsum__note">
          Delivery is calculated from your area at checkout. Final weights are
          confirmed when we pack — you are only charged for what you receive.
        </p>
      </div>
    </>
  );
}

/* ============================================================================
   CartDrawer — desktop. Slides in over the page so the customer never loses
   their place in the catalogue.
   ========================================================================== */

export function CartDrawer() {
  const { overlay, closeOverlay, state } = useStore();
  const { subtotal, count } = useCartTotals();
  const nav = useNavigate();
  const open = overlay.kind === "cart";
  const has = state.cart.length > 0;

  return (
    <Drawer
      open={open}
      onClose={closeOverlay}
      title={count === 0 ? "Your basket" : `Your basket · ${count}`}
      className="cartdrawer"
      footer={
        // Checkout controls only exist when there is something to check out.
        has ? (
          <div className="cartdrawer__foot">
            <div className="cartdrawer__total">
              <span>Subtotal</span>
              <AnimatedTotal value={subtotal} render={money} />
            </div>
            <Button
              variant="primary"
              size="lg"
              block
              iconEnd={<IconChevronRight size={18} />}
              onClick={() => {
                closeOverlay();
                nav("/checkout");
              }}
            >
              Checkout
            </Button>
            <Button variant="quiet" block onClick={closeOverlay}>
              Continue shopping
            </Button>
          </div>
        ) : undefined
      }
    >
      <CartBody onNavigate={closeOverlay} showSubtotal={false} />
    </Drawer>
  );
}
