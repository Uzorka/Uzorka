import { useLayoutEffect, useRef } from "react";

/**
 * StickyBar — the floating action bar that keeps a screen's primary action in
 * the thumb zone on phones.
 *
 * It measures itself and publishes its height as `--stickybar-h` on the root,
 * so the page can pad its content clear of it and toasts can sit above it
 * rather than covering the button they are congratulating you for pressing.
 * The variable falls back to 0px, so screens without a bar are unaffected, and
 * a bar hidden by a media query measures 0 and pads nothing.
 */
export function StickyBar({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const publish = () => {
      const h = Math.round(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--stickybar-h", `${h}px`);
    };
    publish();

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(publish);
      ro.observe(el);
    }
    window.addEventListener("resize", publish);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", publish);
      document.documentElement.style.removeProperty("--stickybar-h");
    };
  }, []);

  return (
    <div ref={ref} className={`stickybuy glass glass--floating ${className}`}>
      {children}
    </div>
  );
}
