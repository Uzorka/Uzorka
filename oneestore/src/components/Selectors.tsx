import { useEffect, useRef, useState } from "react";
import { EXTRAS, PREPS } from "../data/catalog";
import type { ExtraId, PrepId, Product } from "../data/types";
import type { Slot } from "../data/delivery";
import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconInfo,
  IconWarn,
} from "../design/icons";

import { dayLabel, dayShort, money, weight } from "../lib/format";
import { IconButton } from "./Button";
import { Badge } from "./Bits";

/* ============================================================================
   WeightSelector — step 1 of customisation.

   Presets plus a custom slider, never a bare number input. The selected tile
   snaps: a fast scale-and-settle that reads as a physical click. The custom
   panel only appears when asked for, so the common case stays two taps.
   ========================================================================== */

export function WeightSelector({
  product,
  value,
  onChange,
  label = "Choose weight",
}: {
  product: Product;
  value: number;
  onChange: (grams: number) => void;
  label?: string;
}) {
  const isPreset = product.weights.includes(value);
  const [custom, setCustom] = useState(!isPreset);

  return (
    <div className="sel" role="group" aria-label={label}>
      <div className="sel__tiles sel__tiles--weight">
        {product.weights.map((g) => {
          const on = !custom && g === value;
          return (
            <button
              key={g}
              type="button"
              aria-pressed={on}
              className={`tile ${on ? "is-on" : ""}`}
              onClick={() => {
                setCustom(false);
                onChange(g);
              }}
            >
              <span className="tile__main num">{weight(g)}</span>
              <span className="tile__sub num">
                {money((product.pricePerKg * g) / 1000)}
              </span>
              <span className="tile__ring" aria-hidden="true" />
            </button>
          );
        })}
        <button
          type="button"
          aria-pressed={custom}
          className={`tile ${custom ? "is-on" : ""}`}
          onClick={() => setCustom(true)}
        >
          <span className="tile__main">Custom</span>
          <span className="tile__sub">{custom ? weight(value) : "Any weight"}</span>
          <span className="tile__ring" aria-hidden="true" />
        </button>
      </div>

      {custom && (
        <div className="sel__custom">
          <div className="sel__customhead">
            <label htmlFor="custom-weight" className="sel__customlabel">
              Exact weight
            </label>
            <output className="sel__customout num" htmlFor="custom-weight">
              {weight(value)}
            </output>
          </div>
          <input
            id="custom-weight"
            type="range"
            className="slider"
            min={product.minWeight}
            max={product.maxWeight}
            step={100}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
          />
          <div className="sel__customscale num">
            <span>{weight(product.minWeight)}</span>
            <span>{weight(product.maxWeight)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   PreparationSelector — step 2.

   Each option states what it means and what it costs, and — crucially — how
   much prepared seafood it leaves you with. A customer choosing "Filleted"
   should know before they pay that 1 kg becomes about 520 g.
   ========================================================================== */

export function PreparationSelector({
  product,
  grams,
  value,
  onChange,
  remembered,
}: {
  product: Product;
  grams: number;
  value: PrepId | null;
  onChange: (p: PrepId) => void;
  /** The customer's usual choice for this product, if we know it. */
  remembered?: PrepId | null;
}) {
  if (product.preps.length === 0) return null;

  return (
    <div className="sel" role="radiogroup" aria-label="How should we prepare it?">
      <div className="sel__tiles sel__tiles--prep">
        {product.preps.map((id) => {
          const prep = PREPS[id];
          const on = value === id;
          const prepared = Math.round(grams * prep.yield);
          const usual = remembered === id && !on;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={on}
              className={`ptile ${on ? "is-on" : ""}`}
              onClick={() => onChange(id)}
            >
              <span className="ptile__head">
                <span className="ptile__name">{prep.label}</span>
                {prep.perKg > 0 ? (
                  <span className="ptile__price num">
                    +{money((prep.perKg * grams) / 1000)}
                  </span>
                ) : (
                  <span className="ptile__price ptile__price--free">Free</span>
                )}
              </span>
              <span className="ptile__note">{prep.note}</span>
              {prep.yield < 0.97 && (
                <span className="ptile__yield num">
                  ≈ {weight(prepared)} prepared
                </span>
              )}
              {usual && <span className="ptile__usual">You usually pick this</span>}
              <span className="ptile__check" aria-hidden="true">
                <IconCheck size={14} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================================
   ExtrasSelector — step 3, always optional and always priced.
   Nothing that costs money is ever on by default.
   ========================================================================== */

export function ExtrasSelector({
  product,
  value,
  onChange,
  prep,
}: {
  product: Product;
  value: ExtraId[];
  onChange: (ids: ExtraId[]) => void;
  prep: PrepId | null;
}) {
  if (product.extras.length === 0) return null;

  // "Skin removed" is meaningless on a whole fish — only offer it on fillets.
  const relevant = product.extras.filter((id) => {
    if (id === "skin-off") return prep === "filleted" || prep === "steak";
    if (id === "deveined") return prep === "shell-on";
    if (id === "butterfly-cut") return prep === "shell-on";
    return true;
  });

  const toggle = (id: ExtraId) => {
    // Head on and head off are the same decision — selecting one clears the other.
    const opposite: Partial<Record<ExtraId, ExtraId>> = {
      "head-on": "head-off",
      "head-off": "head-on",
    };
    const drop = opposite[id];
    const next = value.includes(id)
      ? value.filter((x) => x !== id)
      : [...value.filter((x) => x !== drop), id];
    onChange(next);
  };

  return (
    <div className="sel" role="group" aria-label="Additional preferences">
      <div className="sel__extras">
        {relevant.map((id) => {
          const extra = EXTRAS[id];
          const on = value.includes(id);
          return (
            <button
              key={id}
              type="button"
              aria-pressed={on}
              className={`etile ${on ? "is-on" : ""}`}
              onClick={() => toggle(id)}
            >
              <span className="etile__box" aria-hidden="true">
                <IconCheck size={13} />
              </span>
              <span className="etile__text">
                <span className="etile__name">{extra.label}</span>
                {extra.note && <span className="etile__note">{extra.note}</span>}
              </span>
              <span className="etile__price num">
                {extra.price > 0 ? `+${money(extra.price)}` : "Free"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================================
   StepHeader — numbers the customisation steps so progress is obvious.
   ========================================================================== */

export function StepHeader({
  n,
  title,
  done,
  hint,
}: {
  n: number;
  title: string;
  done?: boolean;
  hint?: string;
}) {
  return (
    <div className="stephead">
      {/* The number is constant; the fill is what says "this step is settled".
          Swapping the digit for a tick made a three-step flow read as an error
          state when one step was still open. */}
      <span className={`stephead__n ${done ? "is-done" : ""}`} aria-hidden="true">
        {n}
      </span>
      <h3 className="stephead__title">{title}</h3>
      {hint && <span className="stephead__hint">{hint}</span>}
    </div>
  );
}

/* ============================================================================
   DateSelector — a horizontal rail of days, not an HTML date input.

   Each day shows its weekday, its date and its state. Unavailable days stay
   visible and explain themselves when selected, because "why can't I pick
   Tuesday?" is a question the interface should answer without being asked.
   ========================================================================== */

export function DateSelector({
  slots,
  value,
  onChange,
}: {
  slots: Slot[];
  value: string | null;
  onChange: (date: string) => void;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [blocked, setBlocked] = useState<Slot | null>(null);

  // Keep the chosen day in view when it changes from outside (e.g. going back).
  useEffect(() => {
    const el = railRef.current?.querySelector<HTMLElement>('[data-on="true"]');
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [value]);

  const scrollBy = (dx: number) =>
    railRef.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <div className="dates">
      <div className="dates__railwrap">
        <IconButton
          label="Earlier dates"
          variant="glass"
          size="sm"
          className="dates__arrow dates__arrow--l"
          onClick={() => scrollBy(-240)}
        >
          <IconChevronLeft size={18} />
        </IconButton>

        <div className="rail dates__rail" ref={railRef} role="radiogroup" aria-label="Delivery date">
          {slots.map((s) => {
            const on = s.date === value;
            const today = s === slots[0];
            return (
              <button
                key={s.date}
                type="button"
                role="radio"
                aria-checked={on}
                data-on={on}
                /* Deliberately not disabled: an unavailable day stays operable
                   so tapping it explains why, which is the whole point. The
                   accessible name carries the state instead. */
                aria-label={`${dayLabel(s.day)} — ${
                  s.available ? "available" : "unavailable, select to see why"
                }`}
                className={`dtile ${on ? "is-on" : ""} ${
                  s.available ? "" : "is-off"
                }`}
                onClick={() => {
                  if (!s.available) {
                    setBlocked(s);
                    return;
                  }
                  setBlocked(null);
                  onChange(s.date);
                }}
              >
                <span className="dtile__dow">{dayShort(s.day)}</span>
                <span className="dtile__num num">{s.day.getDate()}</span>
                <span className="dtile__state">
                  {today
                    ? s.available
                      ? "Today"
                      : "Closed"
                    : s.available
                      ? "Available"
                      : "Unavailable"}
                </span>
                <span className="dtile__ring" aria-hidden="true" />
              </button>
            );
          })}
        </div>

        <IconButton
          label="Later dates"
          variant="glass"
          size="sm"
          className="dates__arrow dates__arrow--r"
          onClick={() => scrollBy(240)}
        >
          <IconChevronRight size={18} />
        </IconButton>
      </div>

      {blocked && (
        <p className="dates__why" role="status">
          <IconWarn size={15} />
          <span>
            <strong>{dayShort(blocked.day)} {blocked.day.getDate()} is unavailable.</strong>{" "}
            {blocked.reason}
          </span>
        </p>
      )}
    </div>
  );
}

/** Time windows for the chosen day. Full windows stay visible and say so. */
export function WindowSelector({
  slot,
  value,
  onChange,
}: {
  slot: Slot | undefined;
  value: string | null;
  onChange: (id: string, label: string) => void;
}) {
  if (!slot) return null;
  return (
    <div className="windows" role="radiogroup" aria-label="Delivery window">
      {slot.windows.map((w) => {
        const on = value === w.label;
        return (
          <button
            key={w.id}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={w.full}
            className={`wtile ${on ? "is-on" : ""}`}
            onClick={() => onChange(w.id, w.label)}
          >
            <span className="wtile__label num">{w.label}</span>
            <span className="wtile__note">{w.full ? "Full" : w.note}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================================
   Timeline — order stages. The current stage is visually distinct; completed
   stages carry a timestamp; the connector fills rather than snapping.
   ========================================================================== */

export function Timeline({
  stages,
  current,
  stamps,
  compact,
}: {
  stages: { id: string; label: string; detail: string }[];
  current: number;
  stamps: Record<string, number | undefined>;
  compact?: boolean;
}) {
  return (
    <ol className={`tl ${compact ? "tl--compact" : ""}`}>
      {stages.map((s, i) => {
        const done = i < current;
        const now = i === current;
        const stamp = stamps[s.id];
        return (
          <li
            key={s.id}
            className={`tl__item ${done ? "is-done" : ""} ${now ? "is-now" : ""}`}
            aria-current={now ? "step" : undefined}
          >
            <span className="tl__rail" aria-hidden="true">
              <span className="tl__dot">
                {done && <IconCheck size={12} />}
                {now && <span className="tl__pulse" />}
              </span>
              {i < stages.length - 1 && <span className="tl__line" />}
            </span>
            <div className="tl__text">
              <p className="tl__label">
                {s.label}
                {now && (
                  <Badge tone="brand" size="sm" dot>
                    Now
                  </Badge>
                )}
              </p>
              {!compact && <p className="tl__detail">{s.detail}</p>}
              {stamp && (
                <p className="tl__stamp num">
                  {new Date(stamp).toLocaleTimeString("en-NG", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** A short explanatory note, used where the interface owes the customer a why. */
export function Note({
  tone = "info",
  children,
}: {
  tone?: "info" | "warn" | "bad" | "ok";
  children: React.ReactNode;
}) {
  return (
    <p className={`note note--${tone}`}>
      {tone === "info" ? <IconInfo size={15} /> : <IconWarn size={15} />}
      <span>{children}</span>
    </p>
  );
}
