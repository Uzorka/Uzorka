import { useEffect, useRef, useState } from "react";
import { IconCheck, IconStar } from "../design/icons";
import { money, weight } from "../lib/format";
import { useCountUp, useReducedMotion } from "../lib/hooks";

/* ============================================================================
   Price — one component so money always looks like money.
   `size` maps to the hierarchy: 'hero' on the product page, 'md' on cards,
   'sm' in the basket. Totals animate when they change, because a number that
   moves is a number the customer notices.
   ========================================================================== */

export function Price({
  value,
  size = "md",
  unit,
  was,
  animate = false,
  tone = "default",
}: {
  value: number;
  size?: "sm" | "md" | "lg" | "hero";
  /** e.g. "per kg" — set in smaller, quieter type beside the figure. */
  unit?: string;
  /** Strikethrough reference price. */
  was?: number;
  animate?: boolean;
  tone?: "default" | "brand" | "quiet";
}) {
  const shown = useCountUp(animate ? value : value, animate ? 420 : 0);
  return (
    <span className={`price price--${size} price--${tone}`}>
      <span className="num price__figure">{money(animate ? shown : value)}</span>
      {was != null && was > value && (
        <span className="num price__was">{money(was)}</span>
      )}
      {unit && <span className="price__unit">{unit}</span>}
    </span>
  );
}

/* ============================================================================
   Badge — small status/label pill. Tone carries the meaning; never colour alone,
   so each tone pairs with wording that stands on its own.
   ========================================================================== */

export function Badge({
  children,
  tone = "neutral",
  size = "md",
  icon,
  dot,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "ok" | "warn" | "bad" | "info" | "brand" | "sand" | "glass";
  size?: "sm" | "md";
  icon?: React.ReactNode;
  dot?: boolean;
}) {
  return (
    <span className={`badge badge--${tone} badge--${size}`}>
      {dot && <span className="badge__dot" aria-hidden="true" />}
      {icon}
      {children}
    </span>
  );
}

/* ============================================================================
   Chip — a filter or tag, selectable.
   ========================================================================== */

export function Chip({
  children,
  selected,
  onClick,
  icon,
  count,
  as = "button",
}: {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  count?: number;
  as?: "button" | "span";
}) {
  const Tag = as as "button";
  return (
    <Tag
      type={as === "button" ? "button" : undefined}
      className={`chip ${selected ? "is-selected" : ""}`}
      aria-pressed={as === "button" ? !!selected : undefined}
      onClick={onClick}
    >
      {icon}
      <span>{children}</span>
      {count != null && <span className="chip__count num">{count}</span>}
      {selected && <IconCheck size={14} className="chip__check" />}
    </Tag>
  );
}

/* ============================================================================
   Skeleton — layout-preserving loading. Same dimensions as the real thing, so
   nothing jumps when content lands.
   ========================================================================== */

export function Skeleton({
  w,
  h = 14,
  r = 8,
  className = "",
}: {
  w?: number | string;
  h?: number | string;
  r?: number;
  className?: string;
}) {
  return (
    <span
      className={`skel ${className}`}
      style={{ width: w, height: h, borderRadius: r }}
      aria-hidden="true"
    />
  );
}

export function SkeletonProductCard() {
  return (
    <div className="pcard pcard--skel" aria-hidden="true">
      <Skeleton h="100%" r={18} className="pcard__media" />
      <div className="pcard__body">
        <Skeleton w="72%" h={15} />
        <Skeleton w="42%" h={12} />
        <Skeleton w="54%" h={18} />
      </div>
    </div>
  );
}

export function SkeletonOrderCard() {
  return (
    <div className="card card--e1 card--pad-md" aria-hidden="true">
      <div className="row row--between">
        <Skeleton w={110} h={13} />
        <Skeleton w={66} h={22} r={999} />
      </div>
      <div style={{ height: 14 }} />
      <Skeleton w="100%" h={6} r={999} />
      <div style={{ height: 14 }} />
      <Skeleton w="58%" h={13} />
      <div style={{ height: 8 }} />
      <Skeleton w="38%" h={13} />
    </div>
  );
}

/** Announces loading to assistive tech while skeletons show visually. */
export function LoadingRegion({ label }: { label: string }) {
  return (
    <p role="status" aria-live="polite" className="sr-only">
      {label}
    </p>
  );
}

/* ============================================================================
   Rating
   ========================================================================== */

export function Rating({
  value,
  count,
  size = 13,
}: {
  value: number;
  count?: number;
  size?: number;
}) {
  return (
    <span className="rating">
      <IconStar size={size} filled />
      <span className="num">{value.toFixed(1)}</span>
      {count != null && <span className="rating__count">({count})</span>}
    </span>
  );
}

/* ============================================================================
   WeightPill — prepared-weight estimate. Small, but it is the single most
   trust-building number on the product page.
   ========================================================================== */

export function YieldNote({
  raw,
  prepared,
  compact,
}: {
  raw: number;
  prepared: number;
  compact?: boolean;
}) {
  if (prepared >= raw * 0.97) return null;
  return (
    <p className={`yield ${compact ? "yield--compact" : ""}`}>
      <strong className="num">≈ {weight(prepared)}</strong> prepared
      {!compact && (
        <span className="yield__from"> from {weight(raw)} raw — trimming and cleaning</span>
      )}
    </p>
  );
}

/* ============================================================================
   ProgressBar — used for box fill and checkout progress.
   ========================================================================== */

export function ProgressBar({
  value,
  max = 100,
  tone = "brand",
  label,
  height = 8,
}: {
  value: number;
  max?: number;
  tone?: "brand" | "ok" | "warn";
  label?: string;
  height?: number;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      className={`pbar pbar--${tone}`}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <span className="pbar__fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ============================================================================
   Reveal — fades a section up the first time it scrolls into view. Used
   sparingly, on section entrances only, never on individual controls.
   ========================================================================== */

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) {
      setShown(true);
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "-6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <div
      ref={ref}
      className={`reveal ${shown ? "is-in" : ""} ${className}`}
      style={{ transitionDelay: shown ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  );
}

/* ============================================================================
   EmptyState — never a dead end. Always names the next step.
   ========================================================================== */

export function EmptyState({
  icon,
  title,
  body,
  action,
  secondary,
  compact,
}: {
  icon?: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
  secondary?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={`empty ${compact ? "empty--compact" : ""}`}>
      {icon && <div className="empty__icon">{icon}</div>}
      <h3 className="empty__title">{title}</h3>
      <p className="empty__body">{body}</p>
      {(action || secondary) && (
        <div className="empty__actions">
          {action}
          {secondary}
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   Stat — a labelled figure. The admin dashboard and order summaries lean on it.
   ========================================================================== */

export function Stat({
  label,
  value,
  sub,
  tone = "default",
  icon,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  tone?: "default" | "brand" | "warn" | "bad" | "ok";
  icon?: React.ReactNode;
}) {
  return (
    <div className={`stat stat--${tone}`}>
      <div className="stat__top">
        {icon && <span className="stat__icon">{icon}</span>}
        <span className="stat__label">{label}</span>
      </div>
      <p className="stat__value num">{value}</p>
      {sub && <p className="stat__sub">{sub}</p>}
    </div>
  );
}

/** A row of key/value facts — price, weight, delivery. Prominent by design. */
export function FactRow({
  items,
}: {
  items: { label: string; value: React.ReactNode; hint?: string }[];
}) {
  return (
    <dl className="facts">
      {items.map((f) => (
        <div key={f.label} className="facts__item">
          <dt>{f.label}</dt>
          <dd>
            {f.value}
            {f.hint && <span className="facts__hint">{f.hint}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
