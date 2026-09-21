/**
 * ONEESTORE motion system — the JS half.
 *
 * CSS owns declarative motion (see tokens.css). This module exists for the few
 * animations that must be driven from script — the fly-to-cart arc, the box
 * tiles, the count-up on a total — and it deliberately reads the *same* tokens
 * so nothing drifts. Never hard-code a duration in a component.
 */

/** Motion roles, in milliseconds. Mirrors --m-* in tokens.css. */
export const DUR = {
  fast: 130,
  std: 220,
  page: 300,
  spring: 460,
  modal: 260,
  drawer: 340,
} as const;

/** Easing curves. Mirrors --e-* in tokens.css. */
export const EASE = {
  out: "cubic-bezier(.22,.61,.36,1)",
  in: "cubic-bezier(.55,0,.9,.45)",
  inOut: "cubic-bezier(.4,0,.2,1)",
  spring: "cubic-bezier(.34,1.46,.64,1)",
  snap: "cubic-bezier(.2,.9,.24,1.02)",
} as const;

export type MotionRole = keyof typeof DUR;

/** True when the visitor asked the OS to calm animation down. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** A duration that collapses to ~0 under reduced motion. */
export function dur(role: MotionRole): number {
  return prefersReducedMotion() ? 1 : DUR[role];
}

/** `transition` shorthand for a set of properties under one motion role. */
export function transition(
  props: string[],
  role: MotionRole = "std",
  easing: keyof typeof EASE = "out"
): string {
  return props.map((p) => `${p} ${dur(role)}ms ${EASE[easing]}`).join(", ");
}

/**
 * Web Animations helper that no-ops politely when motion is reduced or the API
 * is missing — callers can always `await` the returned promise.
 */
export function animate(
  el: Element | null | undefined,
  keyframes: Keyframe[],
  role: MotionRole = "std",
  options: Omit<KeyframeAnimationOptions, "duration"> = {}
): Promise<void> {
  if (!el || typeof (el as HTMLElement).animate !== "function") {
    return Promise.resolve();
  }
  if (prefersReducedMotion()) return Promise.resolve();
  const anim = (el as HTMLElement).animate(keyframes, {
    duration: DUR[role],
    easing: EASE.out,
    fill: "none",
    ...options,
  });
  return anim.finished.then(
    () => undefined,
    () => undefined // a cancelled animation is not an error
  );
}

/**
 * Arc an element's ghost from one rect to another — used when a product flies
 * into the cart. A slight vertical lift makes the path feel thrown rather than
 * dragged, which is what sells the "it went in" moment.
 */
export function flyTo(
  ghost: HTMLElement,
  from: DOMRect,
  to: DOMRect,
  onDone: () => void
): void {
  if (prefersReducedMotion()) {
    onDone();
    return;
  }
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const lift = Math.min(90, Math.abs(dy) * 0.4 + 30);
  const anim = ghost.animate(
    [
      { transform: "translate3d(0,0,0) scale(1)", opacity: 1, offset: 0 },
      {
        transform: `translate3d(${dx * 0.55}px,${dy * 0.35 - lift}px,0) scale(.7)`,
        opacity: 0.95,
        offset: 0.55,
      },
      {
        transform: `translate3d(${dx}px,${dy}px,0) scale(.22)`,
        opacity: 0.1,
        offset: 1,
      },
    ],
    { duration: DUR.spring + 120, easing: EASE.inOut }
  );
  anim.finished.then(onDone, onDone);
}
