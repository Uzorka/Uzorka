import { forwardRef } from "react";

/**
 * GlassSurface — the only place `backdrop-filter` is allowed.
 *
 * Funnelling glass through one component is what keeps it from spreading:
 * navigation, floating controls, sheets, drawers and selected states use it;
 * content areas never do. Each tier caps its transparency so text on top always
 * clears 4.5:1, and every tier carries a hairline border plus an inner top
 * highlight so the edge survives busy photography behind it.
 */
export type GlassTier = "nav" | "floating" | "panel" | "sheet" | "ink";

export const GlassSurface = forwardRef<
  HTMLDivElement,
  {
    tier?: GlassTier;
    as?: "div" | "aside" | "header" | "nav" | "section" | "footer";
    children: React.ReactNode;
  } & React.HTMLAttributes<HTMLElement>
>(function GlassSurface(
  { tier = "panel", as: Tag = "div", children, className = "", ...rest },
  ref
) {
  return (
    <Tag ref={ref as never} className={`glass glass--${tier} ${className}`} {...rest}>
      {children}
    </Tag>
  );
});

/**
 * Card — the opaque counterpart. Content areas stay solid and easy to scan;
 * this is the workhorse for products, orders, summaries.
 */
export const Card = forwardRef<
  HTMLDivElement,
  {
    elevation?: 0 | 1 | 2 | 3;
    pad?: "none" | "sm" | "md" | "lg";
    /** Adds hover lift and a pointer cursor. Use only when the whole card acts. */
    interactive?: boolean;
    as?: "div" | "article" | "li" | "section";
    children: React.ReactNode;
  } & React.HTMLAttributes<HTMLElement>
>(function Card(
  {
    elevation = 1,
    pad = "md",
    interactive,
    as: Tag = "div",
    children,
    className = "",
    ...rest
  },
  ref
) {
  return (
    <Tag
      ref={ref as never}
      className={`card card--e${elevation} card--pad-${pad} ${
        interactive ? "card--interactive" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
});

/** Section header: a kicker, a title, and an optional trailing action. */
export function SectionHead({
  kicker,
  title,
  sub,
  action,
  id,
}: {
  kicker?: string;
  title: string;
  sub?: string;
  action?: React.ReactNode;
  id?: string;
}) {
  return (
    <div className="sechead">
      <div className="sechead__text">
        {kicker && <p className="kicker">{kicker}</p>}
        <h2 id={id} className="sechead__title">
          {title}
        </h2>
        {sub && <p className="sechead__sub">{sub}</p>}
      </div>
      {action && <div className="sechead__action">{action}</div>}
    </div>
  );
}
