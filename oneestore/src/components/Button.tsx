import { forwardRef, useState } from "react";
import { IconCheck } from "../design/icons";

/**
 * Button — the visual hierarchy of the whole app lives here.
 *
 * Exactly one `primary` per screen. `secondary` is the supporting action,
 * `ghost` and `quiet` are tertiary. The variants are deliberately far apart in
 * weight: if every button looked equally important, nothing would.
 *
 * States: default / hover / pressed / focus / loading / success / disabled.
 * `loading` also blocks re-entry, which is how we prevent double submissions.
 */

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "quiet"
  | "danger"
  | "glass";
export type ButtonSize = "sm" | "md" | "lg";

type Props = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretches to the container — used in sticky bars and sheets. */
  block?: boolean;
  loading?: boolean;
  /** Shows a checkmark and holds it briefly. Confirmation, not decoration. */
  success?: boolean;
  loadingLabel?: string;
  successLabel?: string;
  icon?: React.ReactNode;
  iconEnd?: React.ReactNode;
  children?: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    variant = "secondary",
    size = "md",
    block,
    loading,
    success,
    loadingLabel,
    successLabel,
    icon,
    iconEnd,
    children,
    className = "",
    disabled,
    onClick,
    type = "button",
    ...rest
  },
  ref
) {
  const [ripple, setRipple] = useState<{ x: number; y: number; k: number } | null>(
    null
  );
  const busy = loading || success;

  return (
    <button
      ref={ref}
      type={type}
      className={`btn btn--${variant} btn--${size} ${block ? "btn--block" : ""} ${
        busy ? "is-busy" : ""
      } ${success ? "is-success" : ""} ${className}`}
      disabled={disabled || busy}
      aria-busy={loading || undefined}
      aria-live={busy ? "polite" : undefined}
      onClick={(e) => {
        // The press ripple originates where the finger landed, which makes the
        // feedback feel attached to the touch rather than to the component.
        const r = e.currentTarget.getBoundingClientRect();
        setRipple({ x: e.clientX - r.left, y: e.clientY - r.top, k: Date.now() });
        onClick?.(e);
      }}
      {...rest}
    >
      {ripple && (
        <span
          key={ripple.k}
          className="btn__ripple"
          style={{ left: ripple.x, top: ripple.y }}
          onAnimationEnd={() => setRipple(null)}
        />
      )}
      <span className="btn__inner">
        {loading ? (
          <>
            <span className="btn__spinner" aria-hidden="true" />
            <span>{loadingLabel ?? "Working…"}</span>
          </>
        ) : success ? (
          <>
            <IconCheck size={18} className="btn__check" />
            <span>{successLabel ?? "Done"}</span>
          </>
        ) : (
          <>
            {icon}
            {children != null && <span className="btn__label">{children}</span>}
            {iconEnd}
          </>
        )}
      </span>
    </button>
  );
});

/**
 * IconButton — a square tap target for a single glyph.
 * `label` is required: an icon-only control with no accessible name is a bug.
 */
export const IconButton = forwardRef<
  HTMLButtonElement,
  {
    label: string;
    variant?: "plain" | "glass" | "solid" | "soft";
    size?: "sm" | "md" | "lg";
    active?: boolean;
    children: React.ReactNode;
  } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">
>(function IconButton(
  { label, variant = "plain", size = "md", active, children, className = "", ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={`ibtn ibtn--${variant} ibtn--${size} ${
        active ? "is-active" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
});
