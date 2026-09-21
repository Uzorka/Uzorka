import { useEffect, useMemo, useState } from "react";
import { Badge, EmptyState, Price } from "../components/Bits";
import { StickyBar } from "../components/StickyBar";
import { Button, IconButton } from "../components/Button";
import { AnimatedTotal, Field, OptionRow } from "../components/Controls";
import { CartLineRow } from "../components/CartPanel";
import {
  DateSelector,
  Note,
  WindowSelector,
} from "../components/Selectors";
import { PAYMENT_METHODS, ZONES, buildSlots, zoneById } from "../data/delivery";
import {
  IconBank,
  IconBasket,
  IconCard,
  IconCash,
  IconCheck,
  IconChevronLeft,
  IconClock,
  IconPin,
  IconShield,
  IconUser,
  IconVan,
} from "../design/icons";
import {
  dayLabel,
  formatCard,
  formatExpiry,
  formatPhone,
  money,
  weight,
} from "../lib/format";
import { useIsMobile } from "../lib/hooks";
import { orderNo } from "../lib/id";
import { useNavigate } from "../lib/router";
import { cartSubtotal, deliveryFee, FREE_DELIVERY_OVER } from "../state/pricing";
import { useStore } from "../state/store";

/* ============================================================================
   Checkout

   Five short steps instead of one long form. Progress is always visible, every
   answered step keeps its answer when you move back, and validation happens on
   blur — never saved up for the submit button.
   ========================================================================== */

const STEPS = [
  { id: "contact", label: "Contact", icon: IconUser },
  { id: "delivery", label: "Delivery", icon: IconPin },
  { id: "schedule", label: "Schedule", icon: IconClock },
  { id: "payment", label: "Payment", icon: IconCard },
  { id: "review", label: "Review", icon: IconCheck },
] as const;

type StepId = (typeof STEPS)[number]["id"];

const required = (label: string) => (v: string) =>
  v.trim().length === 0 ? `${label} is needed to complete your order.` : null;

const validEmail = (v: string) =>
  v.trim().length === 0
    ? "We need an email to send your receipt."
    : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
      ? null
      : "That email does not look right — check for a typo.";

const validPhone = (v: string) => {
  const d = v.replace(/\D/g, "");
  if (d.length === 0) return "We need a number so the rider can reach you.";
  if (d.length < 11) return "A Nigerian mobile number has 11 digits.";
  return null;
};

export function Checkout() {
  const { state, dispatch, toast } = useStore();
  const nav = useNavigate();
  const isMobile = useIsMobile();

  const [step, setStep] = useState<StepId>("contact");
  const [visited, setVisited] = useState<StepId[]>(["contact"]);
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);

  // Saved details are pre-filled: a returning customer types nothing.
  const [name, setName] = useState(state.prefs.contact?.name ?? "");
  const [phone, setPhone] = useState(state.prefs.contact?.phone ?? "");
  const [email, setEmail] = useState(state.prefs.contact?.email ?? "");
  const [zoneId, setZoneId] = useState(state.prefs.address?.zoneId ?? "");
  const [address, setAddress] = useState(state.prefs.address?.line ?? "");
  const [instructions, setInstructions] = useState(
    state.prefs.address?.instructions ?? ""
  );
  const [slotDate, setSlotDate] = useState<string | null>(null);
  const [slotWindow, setSlotWindow] = useState<string | null>(null);
  const [payment, setPayment] = useState<string>("card");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const slots = useMemo(() => buildSlots(), []);
  useEffect(() => {
    if (!slotDate) {
      const first = slots.find((s) => s.available);
      if (first) setSlotDate(first.date);
    }
  }, [slots, slotDate]);

  const subtotal = cartSubtotal(state.cart);
  const zone = zoneId ? zoneById(zoneId) : undefined;
  const fee = deliveryFee(subtotal, zone?.fee ?? 0);
  const total = subtotal + fee;
  const grams = state.cart.reduce((s, l) => s + l.grams * l.qty, 0);
  const activeSlot = slots.find((s) => s.date === slotDate);

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const contactOk = !required("Name")(name) && !validPhone(phone) && !validEmail(email);
  const deliveryOk = !!zone?.served && address.trim().length > 4;
  const scheduleOk = !!slotDate && !!slotWindow;
  const paymentOk =
    payment !== "card" ||
    (card.replace(/\D/g, "").length === 16 &&
      /^\d{2}\/\d{2}$/.test(expiry) &&
      cvv.length >= 3);

  const okFor = (id: StepId) =>
    id === "contact"
      ? contactOk
      : id === "delivery"
        ? deliveryOk
        : id === "schedule"
          ? scheduleOk
          : id === "payment"
            ? paymentOk
            : true;

  const goTo = (id: StepId) => {
    setStep(id);
    setVisited((v) => (v.includes(id) ? v : [...v, id]));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const next = () => {
    const i = STEPS.findIndex((s) => s.id === step);
    if (i < STEPS.length - 1) goTo(STEPS[i + 1].id);
  };
  const back = () => {
    const i = STEPS.findIndex((s) => s.id === step);
    if (i > 0) goTo(STEPS[i - 1].id);
    else nav("/cart");
  };

  const place = () => {
    if (placing || placed) return; // never submit twice
    setPlacing(true);
    window.setTimeout(() => {
      const no = orderNo();
      dispatch({
        type: "prefs/patch",
        patch: {
          contact: { name, phone, email },
          address: { line: address, zoneId, instructions },
        },
      });
      dispatch({
        type: "order/place",
        order: {
          no,
          placedAt: Date.now(),
          lines: state.cart,
          subtotal,
          deliveryFee: fee,
          total,
          zoneId,
          address,
          contact: { name, phone, email },
          slotDate: slotDate ?? "",
          slotWindow: slotWindow ?? "",
          payment: PAYMENT_METHODS.find((p) => p.id === payment)?.label ?? "Card",
          stage: 0,
          stamps: { confirmed: Date.now() },
        },
      });
      setPlacing(false);
      setPlaced(true);
      toast({ title: "Order placed", body: no, tone: "ok" });
      window.setTimeout(() => nav(`/order/${no}`), 700);
    }, 1100);
  };

  if (state.cart.length === 0 && !placed) {
    return (
      <div className="page">
        <EmptyState
          icon={<IconBasket size={30} />}
          title="There is nothing to check out"
          body="Your basket is empty. Add some seafood and come back — your details are saved."
          action={
            <Button variant="primary" onClick={() => nav("/shop")}>
              Browse seafood
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="page page--checkout">
      <div className="cohead">
        <IconButton label="Back" variant="soft" onClick={back}>
          <IconChevronLeft size={19} />
        </IconButton>
        <h1 className="cohead__title">Checkout</h1>
        <Badge tone="glass" size="sm">
          <IconShield size={12} /> Secure
        </Badge>
      </div>

      {/* --- Progress ------------------------------------------------------ */}
      <ol className="steps" aria-label="Checkout progress">
        {STEPS.map((s, i) => {
          const done = visited.includes(s.id) && okFor(s.id) && i < stepIndex;
          const now = s.id === step;
          const reachable = i <= stepIndex || visited.includes(s.id);
          return (
            <li
              key={s.id}
              className={`steps__item ${done ? "is-done" : ""} ${now ? "is-now" : ""}`}
            >
              <button
                type="button"
                className="steps__btn"
                disabled={!reachable}
                aria-current={now ? "step" : undefined}
                onClick={() => reachable && goTo(s.id)}
              >
                <span className="steps__mark">
                  {done ? <IconCheck size={13} /> : i + 1}
                </span>
                <span className="steps__label">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <span className="steps__line" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>

      <div className="colayout">
        <div className="copanel">
          {/* --- 1. Contact ------------------------------------------------- */}
          {step === "contact" && (
            <section className="costep" aria-labelledby="co-contact">
              <h2 className="costep__h" id="co-contact">
                Who is this order for?
              </h2>
              <p className="costep__sub">
                The rider calls this number when they arrive. We only use your
                email for the receipt and delivery updates.
              </p>

              <Field
                label="Full name"
                value={name}
                onChange={setName}
                validate={required("A name")}
                autoComplete="name"
                placeholder="Amaka Okafor"
                autoFocus
              />
              <Field
                label="Mobile number"
                value={phone}
                onChange={setPhone}
                validate={validPhone}
                format={formatPhone}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="0803 123 4567"
                hint="Nigerian mobile, 11 digits."
              />
              <Field
                label="Email"
                value={email}
                onChange={setEmail}
                validate={validEmail}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
              />
            </section>
          )}

          {/* --- 2. Delivery ------------------------------------------------ */}
          {step === "delivery" && (
            <section className="costep" aria-labelledby="co-delivery">
              <h2 className="costep__h" id="co-delivery">
                Where are we delivering?
              </h2>
              <p className="costep__sub">
                Choose your area first — it sets the delivery fee and the cut-off
                time for same-day orders.
              </p>

              <div className="zonegrid">
                {ZONES.map((z) => (
                  <button
                    key={z.id}
                    type="button"
                    className={`zone ${zoneId === z.id ? "is-on" : ""} ${
                      z.served ? "" : "is-off"
                    }`}
                    aria-pressed={zoneId === z.id}
                    onClick={() => setZoneId(z.id)}
                  >
                    <span className="zone__name">{z.name}</span>
                    <span className="zone__fee num">
                      {z.served ? money(z.fee) : "Not served"}
                    </span>
                  </button>
                ))}
              </div>

              {/* An unserved area is never a dead end. */}
              {zone && !zone.served && (
                <div className="zoneblock" role="alert">
                  <p className="zoneblock__title">
                    We do not deliver to {zone.name} yet
                  </p>
                  <p className="zoneblock__body">{zone.note}</p>
                  {zone.alternatives && zone.alternatives.length > 0 && (
                    <>
                      <p className="zoneblock__alt">Nearest areas we do reach:</p>
                      <div className="zoneblock__chips">
                        {zone.alternatives.map((id) => {
                          const alt = zoneById(id);
                          if (!alt) return null;
                          return (
                            <button
                              key={id}
                              type="button"
                              className="chip"
                              onClick={() => setZoneId(id)}
                            >
                              {alt.name} · {money(alt.fee)}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {zone?.served && (
                <>
                  <Note tone="ok">
                    {money(zone.fee)} delivery to {zone.name}
                    {subtotal >= FREE_DELIVERY_OVER && " — free on this order"}. Same-day
                    cut-off is {zone.cutoff}.
                  </Note>

                  <Field
                    label="Street address"
                    value={address}
                    onChange={setAddress}
                    validate={(v) =>
                      v.trim().length < 5
                        ? "Add the house number and street so the rider can find you."
                        : null
                    }
                    autoComplete="street-address"
                    placeholder="14 Fola Osibo Street"
                    icon={<IconPin size={18} />}
                    suggestions={[
                      "Admiralty Way",
                      "Fola Osibo Street",
                      "Adeola Odeku Street",
                      "Ozumba Mbadiwe Avenue",
                    ]}
                  />
                  <Field
                    label="Directions for the rider"
                    value={instructions}
                    onChange={setInstructions}
                    optional
                    multiline
                    placeholder="Gate colour, landmark, floor, who to call…"
                    hint="Lagos addresses are hard. A landmark saves everyone a phone call."
                  />
                </>
              )}
            </section>
          )}

          {/* --- 3. Schedule ------------------------------------------------ */}
          {step === "schedule" && (
            <section className="costep" aria-labelledby="co-schedule">
              <h2 className="costep__h" id="co-schedule">
                When would you like it?
              </h2>
              <p className="costep__sub">
                We buy and prepare your seafood on the morning of your delivery, so
                the day you choose is the day it is cut.
              </p>

              <DateSelector slots={slots} value={slotDate} onChange={setSlotDate} />

              {activeSlot?.available && (
                <>
                  <h3 className="costep__sub-h">
                    Time window for {dayLabel(activeSlot.day)}
                  </h3>
                  <WindowSelector
                    slot={activeSlot}
                    value={slotWindow}
                    onChange={(_, label) => setSlotWindow(label)}
                  />
                </>
              )}

              {activeSlot?.available && !slotWindow && (
                <Note tone="info">
                  Pick a window so we know when to load the van. Most people choose
                  the morning — the seafood is freshest earliest.
                </Note>
              )}
            </section>
          )}

          {/* --- 4. Payment -------------------------------------------------- */}
          {step === "payment" && (
            <section className="costep" aria-labelledby="co-payment">
              <h2 className="costep__h" id="co-payment">
                How would you like to pay?
              </h2>
              <p className="costep__sub">
                Final weights are confirmed when we pack. If anything comes in
                under what you ordered, we refund the difference automatically.
              </p>

              {PAYMENT_METHODS.map((m) => (
                <OptionRow
                  key={m.id}
                  kind="radio"
                  name="payment"
                  checked={payment === m.id}
                  onChange={() => setPayment(m.id)}
                  title={m.label}
                  note={m.note}
                  icon={
                    m.id === "card" ? (
                      <IconCard size={20} />
                    ) : m.id === "transfer" ? (
                      <IconBank size={20} />
                    ) : (
                      <IconCash size={20} />
                    )
                  }
                />
              ))}

              {payment === "card" && (
                <div className="cardform">
                  <Field
                    label="Card number"
                    value={card}
                    onChange={setCard}
                    format={formatCard}
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="4000 0000 0000 0000"
                    icon={<IconCard size={18} />}
                    validate={(v) =>
                      v.replace(/\D/g, "").length === 16
                        ? null
                        : "A card number has 16 digits."
                    }
                  />
                  <div className="cardform__row">
                    <Field
                      label="Expiry"
                      value={expiry}
                      onChange={setExpiry}
                      format={formatExpiry}
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM/YY"
                      validate={(v) =>
                        /^\d{2}\/\d{2}$/.test(v) ? null : "Use MM/YY."
                      }
                    />
                    <Field
                      label="CVV"
                      value={cvv}
                      onChange={(v) => setCvv(v.replace(/\D/g, "").slice(0, 4))}
                      type="password"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="123"
                      validate={(v) =>
                        v.length >= 3 ? null : "Three digits on the back."
                      }
                    />
                  </div>
                  <Note tone="info">
                    This is a demonstration build — no card is charged and nothing
                    is stored.
                  </Note>
                </div>
              )}

              {payment === "transfer" && (
                <Note tone="info">
                  We will send account details by email and hold your delivery slot
                  for 30 minutes.
                </Note>
              )}
              {payment === "delivery" && (
                <Note tone="info">
                  The rider carries a card terminal and can take a transfer. Please
                  have the exact amount ready if paying cash.
                </Note>
              )}
            </section>
          )}

          {/* --- 5. Review --------------------------------------------------- */}
          {step === "review" && (
            <section className="costep" aria-labelledby="co-review">
              <h2 className="costep__h" id="co-review">
                Check everything over
              </h2>
              <p className="costep__sub">
                Last look before we start sourcing. Tap any section to change it.
              </p>

              <div className="review">
                <ReviewRow
                  title="Contact"
                  onEdit={() => goTo("contact")}
                  lines={[name, phone, email]}
                />
                <ReviewRow
                  title="Delivery"
                  onEdit={() => goTo("delivery")}
                  lines={[
                    address,
                    zone?.name ?? "",
                    instructions || "No special directions",
                  ]}
                />
                <ReviewRow
                  title="Schedule"
                  onEdit={() => goTo("schedule")}
                  lines={[
                    activeSlot ? dayLabel(activeSlot.day) : "",
                    slotWindow ?? "",
                  ]}
                />
                <ReviewRow
                  title="Payment"
                  onEdit={() => goTo("payment")}
                  lines={[
                    PAYMENT_METHODS.find((p) => p.id === payment)?.label ?? "",
                    payment === "card" && card
                      ? `Card ending ${card.replace(/\D/g, "").slice(-4)}`
                      : "",
                  ]}
                />
              </div>

              <h3 className="costep__sub-h">Your seafood</h3>
              <ul className="clines clines--review">
                {state.cart.map((l) => (
                  <CartLineRow key={l.id} line={l} readOnly compact />
                ))}
              </ul>
            </section>
          )}

          {/* --- Step navigation --------------------------------------------- */}
          {!isMobile && (
            <div className="conav">
              <Button variant="quiet" onClick={back}>
                {stepIndex === 0 ? "Back to basket" : `Back to ${STEPS[stepIndex - 1].label}`}
              </Button>
              {step === "review" ? (
                <Button
                  variant="primary"
                  size="lg"
                  loading={placing}
                  success={placed}
                  loadingLabel="Processing…"
                  successLabel="Order confirmed"
                  disabled={!contactOk || !deliveryOk || !scheduleOk || !paymentOk}
                  onClick={place}
                >
                  Place order · {money(total)}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  disabled={!okFor(step)}
                  onClick={next}
                >
                  Continue to {STEPS[stepIndex + 1].label}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* --- Order summary, always visible on desktop -------------------- */}
        <aside className="cosum card card--e2 card--pad-lg" aria-label="Order summary">
          <h2 className="cosum__h">Order summary</h2>
          <dl className="cosum__rows">
            <div>
              <dt>
                {state.cart.length} item{state.cart.length === 1 ? "" : "s"}
              </dt>
              <dd className="num">{money(subtotal)}</dd>
            </div>
            <div>
              <dt>Total weight</dt>
              <dd className="num">{weight(grams)}</dd>
            </div>
            <div>
              <dt>Delivery {zone?.served ? `to ${zone.name}` : ""}</dt>
              <dd className="num">
                {!zone?.served ? "—" : fee === 0 ? "Free" : money(fee)}
              </dd>
            </div>
            {activeSlot && slotWindow && (
              <div>
                <dt>
                  <IconVan size={14} /> {dayLabel(activeSlot.day)}
                </dt>
                <dd className="cosum__win">{slotWindow}</dd>
              </div>
            )}
            <div className="cosum__total">
              <dt>Total</dt>
              <dd>
                <AnimatedTotal value={total} render={money} />
              </dd>
            </div>
          </dl>

          {subtotal < FREE_DELIVERY_OVER && (
            <p className="cosum__note">
              Add {money(FREE_DELIVERY_OVER - subtotal)} more and delivery is free.
            </p>
          )}

          <ul className="cosum__trust">
            <li>
              <IconShield size={15} /> Every item checked before packing
            </li>
            <li>
              <IconVan size={15} /> Packed on ice, sealed for the journey
            </li>
            <li>
              <IconCheck size={15} /> Refunded automatically if weight comes short
            </li>
          </ul>
        </aside>
      </div>

      {/* --- Mobile sticky step action ------------------------------------- */}
      {isMobile && (
        <StickyBar>
          <div className="stickybuy__row">
            <div className="stickybuy__sum">
              <span className="stickybuy__cfg">
                Step {stepIndex + 1} of {STEPS.length} · {STEPS[stepIndex].label}
              </span>
              <Price value={total} size="lg" />
            </div>
          </div>
          {step === "review" ? (
            <Button
              variant="primary"
              size="lg"
              block
              loading={placing}
              success={placed}
              loadingLabel="Processing…"
              successLabel="Order confirmed"
              disabled={!contactOk || !deliveryOk || !scheduleOk || !paymentOk}
              onClick={place}
            >
              Place order
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              block
              disabled={!okFor(step)}
              onClick={next}
            >
              Continue to {STEPS[stepIndex + 1].label}
            </Button>
          )}
        </StickyBar>
      )}
    </div>
  );
}

function ReviewRow({
  title,
  lines,
  onEdit,
}: {
  title: string;
  lines: string[];
  onEdit: () => void;
}) {
  return (
    <div className="rrow">
      <div className="rrow__text">
        <p className="rrow__title">{title}</p>
        {lines.filter(Boolean).map((l, i) => (
          <p key={i} className="rrow__line">
            {l}
          </p>
        ))}
      </div>
      <button type="button" className="rrow__edit" onClick={onEdit}>
        Change
      </button>
    </div>
  );
}

