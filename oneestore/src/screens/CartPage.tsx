import { CartBody } from "../components/CartPanel";
import { StickyBar } from "../components/StickyBar";
import { Button } from "../components/Button";
import { AnimatedTotal } from "../components/Controls";
import { BackBar } from "../components/Nav";
import { IconChevronRight } from "../design/icons";
import { money } from "../lib/format";
import { useNavigate } from "../lib/router";
import { useCartTotals, useStore } from "../state/store";

/**
 * The basket as a full screen — phones only in practice, since larger screens
 * open the drawer. Same body component either way, so the two can never drift.
 */
export function CartPage() {
  const { state } = useStore();
  const { subtotal, count } = useCartTotals();
  const nav = useNavigate();
  const has = state.cart.length > 0;

  return (
    <div className="page page--narrow">
      <BackBar label="Keep shopping" to="/shop" />
      <h1 className="cartpage__title">
        Your basket
        {count > 0 && <span className="cartpage__count num">{count}</span>}
      </h1>

      <CartBody />

      {/* Checkout controls exist only when there is something to check out. */}
      {has && (
        <StickyBar>
          <div className="stickybuy__row">
            <div className="stickybuy__sum">
              <span className="stickybuy__cfg">Subtotal · delivery at checkout</span>
              <AnimatedTotal
                value={subtotal}
                render={money}
                className="stickybuy__total"
              />
            </div>
          </div>
          <Button
            variant="primary"
            size="lg"
            block
            iconEnd={<IconChevronRight size={18} />}
            onClick={() => nav("/checkout")}
          >
            Checkout
          </Button>
        </StickyBar>
      )}
    </div>
  );
}
