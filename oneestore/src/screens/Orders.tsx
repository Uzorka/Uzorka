import { useMemo, useState } from "react";
import { Badge, EmptyState, ProgressBar, Reveal, Stat } from "../components/Bits";
import { Button } from "../components/Button";
import { CartLineRow } from "../components/CartPanel";
import { Adaptive } from "../components/Overlays";
import { BackBar } from "../components/Nav";
import { Note, Timeline } from "../components/Selectors";
import { SectionHead } from "../components/Surface";
import { productById } from "../data/catalog";
import { STAGES, zoneById } from "../data/delivery";
import type { Order } from "../data/types";
import {
  IconChat,
  IconChevronRight,
  IconClock,
  IconPin,
  IconReceipt,
  IconRepeat,
  IconVan,
} from "../design/icons";
import { dayLabel, money, stampLabel, weight } from "../lib/format";
import { useNavigate } from "../lib/router";
import { useStore } from "../state/store";
import { NotFound } from "./NotFound";

/* ============================================================================
   Orders list
   ========================================================================== */

export function Orders() {
  const { state, dispatch, toast } = useStore();
  const nav = useNavigate();
  const orders = state.orders;

  const reorder = (o: Order) => {
    o.lines.forEach((l) =>
      dispatch({
        type: "cart/add",
        line: {
          productId: l.productId,
          grams: l.grams,
          prep: l.prep,
          extras: l.extras,
          qty: l.qty,
        },
      })
    );
    toast({
      title: "Added to your basket",
      body: `${o.lines.length} items from ${o.no}`,
      tone: "ok",
      action: { label: "View basket", run: () => nav("/cart") },
    });
  };

  if (orders.length === 0) {
    return (
      <div className="page page--narrow">
        <h1 className="shophead__title" style={{ paddingTop: "var(--s-6)" }}>
          Your orders
        </h1>
        <EmptyState
          icon={<IconReceipt size={30} />}
          title="No orders yet"
          body="Once you order, you can track it here stage by stage — and reorder the whole thing in one tap."
          action={
            <Button variant="primary" onClick={() => nav("/shop")}>
              Browse seafood
            </Button>
          }
          secondary={
            <Button variant="quiet" onClick={() => nav("/meals")}>
              Shop by meal
            </Button>
          }
        />
      </div>
    );
  }

  const live = orders.filter((o) => o.stage < STAGES.length - 1);
  const past = orders.filter((o) => o.stage >= STAGES.length - 1);

  return (
    <div className="page page--narrow">
      <h1 className="shophead__title" style={{ paddingTop: "var(--s-6)" }}>
        Your orders
      </h1>

      {live.length > 0 && (
        <>
          <SectionHead title="On the way" />
          <div className="orderlist">
            {live.map((o) => (
              <OrderCard key={o.no} order={o} onReorder={() => reorder(o)} />
            ))}
          </div>
        </>
      )}

      {past.length > 0 && (
        <Reveal>
          <SectionHead title="Delivered" />
          <div className="orderlist">
            {past.map((o) => (
              <OrderCard key={o.no} order={o} onReorder={() => reorder(o)} />
            ))}
          </div>
        </Reveal>
      )}
    </div>
  );
}

function OrderCard({ order, onReorder }: { order: Order; onReorder: () => void }) {
  const nav = useNavigate();
  const stage = STAGES[order.stage];
  const done = order.stage >= STAGES.length - 1;
  const pct = ((order.stage + 1) / STAGES.length) * 100;

  return (
    <article className="ocard card card--e1 card--pad-md">
      <button
        type="button"
        className="ocard__hit"
        onClick={() => nav(`/order/${order.no}`)}
        aria-label={`Track order ${order.no}`}
      />
      <div className="ocard__top">
        <div>
          <p className="ocard__no num">{order.no}</p>
          <p className="ocard__when">{stampLabel(order.placedAt)}</p>
        </div>
        <Badge tone={done ? "ok" : "brand"} size="sm" dot={!done}>
          {stage.label}
        </Badge>
      </div>

      {!done && (
        <div className="ocard__prog">
          <ProgressBar value={pct} label={`Order ${order.no} progress`} height={6} />
          <p className="ocard__stagenote">{stage.detail}</p>
        </div>
      )}

      <div className="ocard__lines">
        {order.lines.slice(0, 3).map((l) => {
          const p = productById(l.productId);
          return (
            <span key={l.id} className="ocard__chip num">
              {p?.name} · {weight(l.grams)}
            </span>
          );
        })}
        {order.lines.length > 3 && (
          <span className="ocard__chip">+{order.lines.length - 3} more</span>
        )}
      </div>

      <div className="ocard__foot">
        <span className="ocard__total num">{money(order.total)}</span>
        <div className="ocard__actions">
          <Button
            variant="quiet"
            size="sm"
            icon={<IconRepeat size={16} />}
            onClick={onReorder}
          >
            Order again
          </Button>
          <Button
            variant="secondary"
            size="sm"
            iconEnd={<IconChevronRight size={15} />}
            onClick={() => nav(`/order/${order.no}`)}
          >
            {done ? "Details" : "Track"}
          </Button>
        </div>
      </div>
    </article>
  );
}

/* ============================================================================
   Order tracking

   The stage advances on its own while the page is open. Progress animates in
   rather than the screen re-rendering under the customer, which is the
   difference between "alive" and "distracting".
   ========================================================================== */

export function OrderTracking({ no }: { no?: string }) {
  const { state, dispatch, toast } = useStore();
  const nav = useNavigate();
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueKind, setIssueKind] = useState("");
  const [issueText, setIssueText] = useState("");
  const [sent, setSent] = useState(false);

  const order = useMemo(
    () => state.orders.find((o) => o.no === no),
    [state.orders, no]
  );

  if (!order) return <NotFound />;

  const stage = STAGES[order.stage];
  const done = order.stage >= STAGES.length - 1;
  const zone = zoneById(order.zoneId);
  const justPlaced = Date.now() - order.placedAt < 12000;

  return (
    <div className="page page--narrow">
      <BackBar label="Orders" to="/orders" />

      {/* --- Confirmation, for a freshly placed order --------------------- */}
      {justPlaced && (
        <section className="confirm">
          <span className="confirm__tick" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="34" height="34" fill="none">
              <path
                d="m8 16.5 5.5 5.5L24 11"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="26"
                className="confirm__path"
              />
            </svg>
          </span>
          <h1 className="confirm__title">Order confirmed</h1>
          <p className="confirm__body">
            Thank you. We have started sourcing your seafood and you will get a
            message at every stage.
          </p>

          <dl className="confirm__facts">
            <div>
              <dt>Order number</dt>
              <dd className="num">{order.no}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>
                {dayLabel(new Date(order.slotDate))}
                <span className="confirm__win">{order.slotWindow}</span>
              </dd>
            </div>
            <div>
              <dt>Amount</dt>
              <dd className="num">{money(order.total)}</dd>
            </div>
            <div>
              <dt>Where</dt>
              <dd>
                {order.address}
                <span className="confirm__win">{zone?.name}</span>
              </dd>
            </div>
          </dl>

          <div className="confirm__actions">
            <Button
              variant="primary"
              size="lg"
              icon={<IconVan size={18} />}
              onClick={() =>
                document
                  .getElementById("track")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            >
              Track order
            </Button>
            <Button variant="secondary" size="lg" onClick={() => nav("/shop")}>
              Continue shopping
            </Button>
          </div>
        </section>
      )}

      {/* --- Live status ---------------------------------------------------- */}
      <section className="track" id="track">
        <header className="track__head card card--e2 card--pad-lg">
          <div className="track__headtop">
            <div>
              <p className="kicker">{done ? "Delivered" : "In progress"}</p>
              <h2 className="track__title">{stage.label}</h2>
              <p className="track__detail">{stage.detail}</p>
            </div>
            <Badge tone={done ? "ok" : "brand"} dot={!done}>
              {order.no}
            </Badge>
          </div>

          <div className="track__stats">
            <Stat
              label="Delivery day"
              value={dayLabel(new Date(order.slotDate))}
              sub={order.slotWindow}
              icon={<IconClock size={15} />}
              tone="brand"
            />
            <Stat
              label="Going to"
              value={zone?.name ?? "Lagos"}
              sub={order.address}
              icon={<IconPin size={15} />}
            />
            <Stat
              label="Total"
              value={money(order.total)}
              sub={`${order.lines.length} items`}
              icon={<IconReceipt size={15} />}
            />
          </div>
        </header>

        <div className="track__timeline card card--e1 card--pad-lg">
          <Timeline
            stages={STAGES}
            current={order.stage}
            stamps={order.stamps as Record<string, number | undefined>}
          />
        </div>

        {order.issue && (
          <Note tone="warn">
            You reported: “{order.issue.message}”. Our team has it and will call
            you on {order.contact.phone}.
          </Note>
        )}
      </section>

      {/* --- What is in it -------------------------------------------------- */}
      <SectionHead title="What is in this order" />
      <ul className="clines">
        {order.lines.map((l) => (
          <CartLineRow key={l.id} line={l} readOnly />
        ))}
      </ul>

      <div className="track__totals card card--e1 card--pad-md">
        <div>
          <span>Subtotal</span>
          <span className="num">{money(order.subtotal)}</span>
        </div>
        <div>
          <span>Delivery</span>
          <span className="num">
            {order.deliveryFee === 0 ? "Free" : money(order.deliveryFee)}
          </span>
        </div>
        <div className="track__grand">
          <span>Total paid</span>
          <span className="num">{money(order.total)}</span>
        </div>
        <p className="track__paynote">Paid by {order.payment}</p>
      </div>

      <div className="track__help">
        <Button
          variant="secondary"
          icon={<IconRepeat size={17} />}
          onClick={() => {
            order.lines.forEach((l) =>
              dispatch({
                type: "cart/add",
                line: {
                  productId: l.productId,
                  grams: l.grams,
                  prep: l.prep,
                  extras: l.extras,
                  qty: l.qty,
                },
              })
            );
            toast({ title: "Added to your basket", body: order.no, tone: "ok" });
          }}
        >
          Order this again
        </Button>
        <Button
          variant="quiet"
          icon={<IconChat size={17} />}
          onClick={() => setIssueOpen(true)}
        >
          Something wrong with this order?
        </Button>
      </div>

      {/* --- Report an issue ------------------------------------------------ */}
      <Adaptive
        open={issueOpen}
        onClose={() => setIssueOpen(false)}
        title="Tell us what happened"
        width={460}
        footer={
          <Button
            variant="primary"
            size="lg"
            block
            disabled={!issueKind}
            success={sent}
            successLabel="Sent — we will call you"
            onClick={() => {
              dispatch({
                type: "order/issue",
                no: order.no,
                kind: issueKind,
                message: issueText || issueKind,
              });
              setSent(true);
              window.setTimeout(() => {
                setIssueOpen(false);
                setSent(false);
                toast({
                  title: "Reported",
                  body: "We will call you within the hour.",
                  tone: "ok",
                });
              }, 900);
            }}
          >
            Send report
          </Button>
        }
      >
        <p className="ask__intro">
          Tell us what is wrong and we will fix it — a replacement on the next
          delivery, or a refund. You do not need to send photos unless you want to.
        </p>
        <div className="issuegrid">
          {[
            "Something was missing",
            "It was not fresh",
            "Wrong preparation",
            "Weight was short",
            "It arrived late",
            "Something else",
          ].map((k) => (
            <button
              key={k}
              type="button"
              className={`chip ${issueKind === k ? "is-selected" : ""}`}
              onClick={() => setIssueKind(k)}
            >
              {k}
            </button>
          ))}
        </div>
        <label className="ask__label" htmlFor="issue-field">
          Anything else we should know
        </label>
        <textarea
          id="issue-field"
          className="ask__field"
          rows={3}
          value={issueText}
          onChange={(e) => setIssueText(e.target.value)}
          placeholder="Optional"
        />
      </Adaptive>
    </div>
  );
}
