import { useCallback, useEffect, useRef, useState } from "react";

/** Reactive media query. */
export function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia(query).matches
      : false
  );
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

/** The one place the app decides "is this a phone layout?". 768px is the line
 *  where the desktop nav and the multi-column grids become honest. */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}

/** True when the device has a real pointer, i.e. hover affordances are useful. */
export function useCanHover(): boolean {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}

export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** Locks body scroll while any overlay is open. Reference-counted, so nested
 *  overlays (sheet opened from a drawer) don't unlock each other. */
let lockCount = 0;
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    lockCount += 1;
    document.body.dataset.locked = "true";
    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) delete document.body.dataset.locked;
    };
  }, [active]);
}

/** Escape-to-close, registered only while open so the innermost overlay wins. */
export function useEscape(active: boolean, onEscape: () => void): void {
  useEffect(() => {
    if (!active) return;
    const on = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onEscape();
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [active, onEscape]);
}

/** Traps Tab inside an overlay and restores focus to the opener on close. */
export function useFocusTrap(
  active: boolean,
  ref: React.RefObject<HTMLElement>
): void {
  useEffect(() => {
    if (!active || !ref.current) return;
    const root = ref.current;
    const opener = document.activeElement as HTMLElement | null;
    const sel =
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

    const first = root.querySelector<HTMLElement>("[data-autofocus]") ??
      root.querySelector<HTMLElement>(sel);
    // Wait a frame so the entry animation doesn't fight the scroll-into-view.
    const t = window.setTimeout(() => first?.focus({ preventScroll: true }), 40);

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = Array.from(root.querySelectorAll<HTMLElement>(sel)).filter(
        (el) => el.offsetParent !== null
      );
      if (items.length === 0) return;
      const head = items[0];
      const tail = items[items.length - 1];
      if (e.shiftKey && document.activeElement === head) {
        e.preventDefault();
        tail.focus();
      } else if (!e.shiftKey && document.activeElement === tail) {
        e.preventDefault();
        head.focus();
      }
    };
    root.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      root.removeEventListener("keydown", onKey);
      opener?.focus?.({ preventScroll: true });
    };
  }, [active, ref]);
}

/**
 * Keeps an overlay mounted through its exit animation.
 * Returns [mounted, state] where state drives the enter/exit CSS.
 */
export function usePresence(
  open: boolean,
  exitMs: number
): [boolean, "open" | "closing"] {
  const [mounted, setMounted] = useState(open);
  const [state, setState] = useState<"open" | "closing">(open ? "open" : "closing");
  useEffect(() => {
    if (open) {
      setMounted(true);
      // Next frame, so the element paints in its "from" state first.
      const r = requestAnimationFrame(() => setState("open"));
      return () => cancelAnimationFrame(r);
    }
    setState("closing");
    const t = window.setTimeout(() => setMounted(false), exitMs);
    return () => window.clearTimeout(t);
  }, [open, exitMs]);
  return [mounted, state];
}

/** Animates a number towards its target — used on totals and cart counts so a
 *  change is felt, not just seen. Snaps instantly under reduced motion. */
export function useCountUp(value: number, ms = 420): number {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef(0);

  useEffect(() => {
    if (reduced || fromRef.current === value) {
      fromRef.current = value;
      setShown(value);
      return;
    }
    const from = fromRef.current;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      // easeOutCubic — fast off the mark, settles gently.
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(from + (value - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, ms, reduced]);

  return shown;
}

/** Fires when an element scrolls into view — for reveal-on-scroll sections. */
export function useInView<T extends HTMLElement>(
  ref: React.RefObject<T>,
  rootMargin = "-8% 0px"
): boolean {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, seen, rootMargin]);
  return seen;
}

/** Debounced value — search suggestions without a keystroke storm. */
export function useDebounced<T>(value: T, ms = 140): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setV(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return v;
}

/**
 * Swipe-to-dismiss for sheets and drawers. Tracks a pointer drag along one
 * axis, rubber-bands the wrong way, and dismisses past a distance/velocity
 * threshold. Always paired with a visible close control — a gesture is never
 * the only way out.
 */
export function useSwipeDismiss(
  axis: "y" | "x",
  onDismiss: () => void,
  enabled = true
) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef({ p: 0, t: 0 });

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled || e.pointerType === "mouse") return;
      start.current = { p: axis === "y" ? e.clientY : e.clientX, t: Date.now() };
      setDragging(true);
    },
    [axis, enabled]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const now = axis === "y" ? e.clientY : e.clientX;
      const raw = now - start.current.p;
      // Only the dismiss direction travels freely; the other rubber-bands.
      setOffset(raw > 0 ? raw : raw * 0.22);
    },
    [dragging, axis]
  );

  const end = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    const elapsed = Date.now() - start.current.t || 1;
    const velocity = offset / elapsed; // px per ms
    if (offset > 108 || velocity > 0.6) onDismiss();
    setOffset(0);
  }, [dragging, offset, onDismiss]);

  return {
    offset: dragging ? Math.max(0, offset) : 0,
    dragging,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: end,
      onPointerCancel: end,
    },
  };
}
