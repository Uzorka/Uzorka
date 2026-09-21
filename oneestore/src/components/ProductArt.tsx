import type { MotifId } from "../data/types";

/**
 * ProductArt — ONEESTORE's stand-in for photography.
 *
 * Real product photography would sit here. Until it does, this draws a
 * deterministic, per-product tile: a two-stop water gradient in the product's
 * hue, a soft light break, and a line silhouette of the species group. It is
 * original artwork, it never fails to load, it costs nothing to transfer, and it
 * keeps the grid looking intentional rather than broken.
 *
 * Swap this component for an <img> and every card, sheet and order row inherits
 * real photos with no further changes.
 */

const MOTIF_PATHS: Record<MotifId, React.ReactNode> = {
  fish: (
    <>
      <path d="M18 62c14-20 30-30 50-30 17 0 31 9 40 22 1.6 2.4 1.6 5.6 0 8-9 13-23 22-40 22-20 0-36-10-50-22Z" />
      <path d="m108 47 1-15-17 10M108 77l1 15-17-10" />
      <circle cx="46" cy="55" r="3.4" fill="currentColor" stroke="none" />
      <path d="M62 44c6 8 6 16 0 24M78 42c7 9 7 19 0 28" opacity=".55" />
    </>
  ),
  prawn: (
    <>
      <path d="M104 34c-27 0-44 11-53 25-7 12-5 25 4 31 9 7 22 4 28-5 4-6 4-12 1-16" />
      <path d="M104 34c-14 2-25 7-32 15" />
      <path d="M46 74 33 68M48 87l-13 3M56 97l-9 10M64 101l-4 12" opacity=".7" />
      <circle cx="96" cy="42" r="2.8" fill="currentColor" stroke="none" />
    </>
  ),
  crab: (
    <>
      <path d="M38 74a30 30 0 0 1 60 0" />
      <path d="M38 74h60" />
      <path d="M32 52 18 38M104 52l14-14M18 38l8-9M118 38l-8-9" />
      <path d="M44 84 30 98M92 84l14 14M58 90l-4 14M78 90l4 14" opacity=".8" />
      <circle cx="56" cy="62" r="2.6" fill="currentColor" stroke="none" />
      <circle cx="80" cy="62" r="2.6" fill="currentColor" stroke="none" />
    </>
  ),
  shell: (
    <>
      <path d="M68 104c-26 0-47-19-47-43s21-40 47-40 47 16 47 40-21 43-47 43Z" />
      <path d="M68 21v83M41 25l12 76M95 25 83 101" opacity=".7" />
      <path d="M54 23l6 79M82 23l-6 79" opacity=".35" />
    </>
  ),
  spiral: (
    <>
      <path d="M68 106a44 44 0 1 0-44-44 31 31 0 0 0 31 31 21 21 0 0 0 21-21 14 14 0 0 0-14-14 9 9 0 0 0-9 9" />
      <path d="M24 62h-8M112 62h8" opacity=".4" />
    </>
  ),
  smoke: (
    <>
      <path d="M22 78c12-16 26-24 44-24 15 0 28 7 36 18 1.4 2 1.4 4.6 0 6.6-8 11-21 18-36 18-18 0-32-8-44-18Z" />
      <path d="m102 66 1-12-14 8M102 90l1 12-14-8" />
      <path d="M44 34c0-7 7-8 7-15M60 30c0-6 6-7 6-13M76 34c0-7 6-8 6-14" opacity=".55" />
      <circle cx="46" cy="72" r="3" fill="currentColor" stroke="none" />
    </>
  ),
};

export function ProductArt({
  hue,
  motif,
  /** 'card' keeps the motif small and calm; 'hero' fills a product page. */
  variant = "card",
  className = "",
  dim,
}: {
  hue: number;
  motif: MotifId;
  variant?: "card" | "hero" | "thumb";
  className?: string;
  /** Sold-out items desaturate rather than disappearing. */
  dim?: boolean;
}) {
  const light = `hsl(${hue} 58% 87%)`;
  const mid = `hsl(${hue} 52% 68%)`;
  const deep = `hsl(${hue} 58% 40%)`;

  return (
    <div
      className={`art art--${variant} ${dim ? "is-dim" : ""} ${className}`}
      style={{
        // Layered: a low sun, a water gradient, and a faint caustic sweep.
        background: `
          radial-gradient(120% 86% at 20% 6%, rgba(255,255,255,.68), rgba(255,255,255,0) 54%),
          radial-gradient(112% 92% at 92% 104%, ${deep}, rgba(0,0,0,0) 66%),
          linear-gradient(158deg, ${light}, ${mid})`,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 136 136"
        className="art__motif"
        fill="none"
        stroke={`hsl(${hue} 62% 20%)`}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {MOTIF_PATHS[motif]}
      </svg>
      <span className="art__sheen" />
    </div>
  );
}
