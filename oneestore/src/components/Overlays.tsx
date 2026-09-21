import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { IconClose } from "../design/icons";
import { DUR } from "../design/motion";
import {
  useEscape,
  useFocusTrap,
  useIsMobile,
  usePresence,
  useScrollLock,
  useSwipeDismiss,
} from "../lib/hooks";
import { IconButton } from "./Button";

/* ============================================================================
   Shared scrim. One element, one z-index, one fade.
   ========================================================================== */

function Scrim({
  state,
  onClick,
  opacity = 1,
}: {
  state: "open" | "closing";
  onClick: () => void;
  opacity?: number;
}) {
  return (
    <div
      className={`scrim ${state === "open" ? "is-open" : ""}`}
      style={{ opacity: state === "open" ? opacity : 0 }}
      onClick={onClick}
      aria-hidden="true"
    />
  );
}

type BaseProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Hidden visually but read by screen readers when there is no visible title. */
  srTitle?: string;
  children: React.ReactNode;
  /** Pinned footer — where a sheet's primary action lives. */
  footer?: React.ReactNode;
  className?: string;
};

/* ============================================================================
   BottomSheet — the mobile workhorse.

   Filters, customisation, delivery dates, sort, address pickers: on a phone
   these are all sheets, because a sheet keeps the content in the thumb zone and
   keeps the page behind it visible, so the customer never loses their place.
   Swipe down dismisses; the close button is always there too, because a gesture
   is never the only way out.
   ========================================================================== */

export function BottomSheet({
  open,
  onClose,
  title,
  srTitle,
  children,
  footer,
  className = "",
  /** Sheet grows to content up to this share of the viewport. */
  maxHeight = "88vh",
  /** Drag handle at the top. Hide it for sheets that scroll a long list. */
  handle = true,
}: BaseProps & { maxHeight?: string; handle?: boolean }) {
  const [mounted, state] = usePresence(open, DUR.drawer);
  const panel = useRef<HTMLDivElement>(null);
  useScrollLock(mounted);
  useEscape(open, onClose);
  useFocusTrap(open, panel);
  const swipe = useSwipeDismiss("y", onClose, open);

  if (!mounted) return null;

  return createPortal(
    <div className="overlay overlay--sheet" role="presentation">
      <Scrim state={state} onClick={onClose} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? srTitle}
        className={`sheet glass glass--sheet ${
          state === "open" ? "is-open" : "is-closing"
        } ${swipe.dragging ? "is-dragging" : ""} ${className}`}
        style={{
          maxHeight,
          transform: swipe.offset ? `translate3d(0,${swipe.offset}px,0)` : undefined,
        }}
      >
        <div className="sheet__grip" {...swipe.handlers}>
          {handle && <span className="sheet__handle" aria-hidden="true" />}
          {(title || srTitle) && (
            <div className="sheet__head">
              {title ? (
                <h2 className="sheet__title">{title}</h2>
              ) : (
                <h2 className="sr-only">{srTitle}</h2>
              )}
              <IconButton label="Close" variant="soft" size="sm" onClick={onClose}>
                <IconClose size={18} />
              </IconButton>
            </div>
          )}
        </div>
        <div className="sheet__body">{children}</div>
        {footer && <div className="sheet__foot">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

/* ============================================================================
   Drawer — the desktop counterpart. Slides from the right; used for the basket
   and for anything that should not take the customer off the page they are on.
   ========================================================================== */

export function Drawer({
  open,
  onClose,
  title,
  srTitle,
  children,
  footer,
  className = "",
  width = 460,
}: BaseProps & { width?: number }) {
  const [mounted, state] = usePresence(open, DUR.drawer);
  const panel = useRef<HTMLDivElement>(null);
  useScrollLock(mounted);
  useEscape(open, onClose);
  useFocusTrap(open, panel);
  const swipe = useSwipeDismiss("x", onClose, open);

  if (!mounted) return null;

  return createPortal(
    <div className="overlay overlay--drawer" role="presentation">
      <Scrim state={state} onClick={onClose} />
      <aside
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? srTitle}
        className={`drawer glass glass--sheet ${
          state === "open" ? "is-open" : "is-closing"
        } ${className}`}
        style={{
          width,
          transform: swipe.offset ? `translate3d(${swipe.offset}px,0,0)` : undefined,
        }}
        {...swipe.handlers}
      >
        <div className="drawer__head">
          {title ? (
            <h2 className="drawer__title">{title}</h2>
          ) : (
            <h2 className="sr-only">{srTitle}</h2>
          )}
          <IconButton label="Close" variant="soft" size="sm" onClick={onClose}>
            <IconClose size={18} />
          </IconButton>
        </div>
        <div className="drawer__body">{children}</div>
        {footer && <div className="drawer__foot">{footer}</div>}
      </aside>
    </div>,
    document.body
  );
}

/* ============================================================================
   Dialog — centred, for confirmations and short focused tasks.
   ========================================================================== */

export function Dialog({
  open,
  onClose,
  title,
  srTitle,
  children,
  footer,
  className = "",
  width = 440,
}: BaseProps & { width?: number }) {
  const [mounted, state] = usePresence(open, DUR.modal);
  const panel = useRef<HTMLDivElement>(null);
  useScrollLock(mounted);
  useEscape(open, onClose);
  useFocusTrap(open, panel);

  if (!mounted) return null;

  return createPortal(
    <div className="overlay overlay--dialog" role="presentation">
      <Scrim state={state} onClick={onClose} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? srTitle}
        className={`dialog glass glass--sheet ${
          state === "open" ? "is-open" : "is-closing"
        } ${className}`}
        style={{ width }}
      >
        <div className="dialog__head">
          {title ? (
            <h2 className="dialog__title">{title}</h2>
          ) : (
            <h2 className="sr-only">{srTitle}</h2>
          )}
          <IconButton label="Close" variant="soft" size="sm" onClick={onClose}>
            <IconClose size={18} />
          </IconButton>
        </div>
        <div className="dialog__body">{children}</div>
        {footer && <div className="dialog__foot">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

/**
 * Adaptive — the rule the app follows everywhere: a sheet on phones, a dialog
 * (or drawer) on larger screens. Components ask for the *purpose*, not the form.
 */
export function Adaptive({
  desktop = "dialog",
  handle,
  maxHeight,
  ...props
}: BaseProps & {
  desktop?: "dialog" | "drawer";
  width?: number;
  maxHeight?: string;
  handle?: boolean;
}) {
  const mobile = useIsMobile();
  if (mobile) return <BottomSheet {...props} handle={handle} maxHeight={maxHeight} />;
  if (desktop === "drawer") return <Drawer {...props} />;
  return <Dialog {...props} />;
}

/* ============================================================================
   Popover — desktop-only lightweight menu anchored to a control. On phones the
   caller should use a BottomSheet instead; this never becomes a tiny tap menu.
   ========================================================================== */

export function Popover({
  open,
  onClose,
  anchorRef,
  children,
  align = "end",
  label,
}: {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement>;
  children: React.ReactNode;
  align?: "start" | "end";
  label: string;
}) {
  const [mounted, state] = usePresence(open, DUR.modal);
  const panel = useRef<HTMLDivElement>(null);
  useEscape(open, onClose);
  useFocusTrap(open, panel);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panel.current?.contains(t) || anchorRef.current?.contains(t)) return;
      onClose();
    };
    // Defer so the click that opened the popover doesn't immediately close it.
    const id = window.setTimeout(
      () => window.addEventListener("pointerdown", onDown),
      0
    );
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open, onClose, anchorRef]);

  if (!mounted) return null;

  const rect = anchorRef.current?.getBoundingClientRect();
  const top = (rect?.bottom ?? 0) + 8;
  const style: React.CSSProperties =
    align === "end"
      ? { top, right: Math.max(8, window.innerWidth - (rect?.right ?? 0)) }
      : { top, left: Math.max(8, rect?.left ?? 0) };

  return createPortal(
    <div
      ref={panel}
      role="dialog"
      aria-label={label}
      className={`popover glass glass--floating ${
        state === "open" ? "is-open" : "is-closing"
      }`}
      style={style}
    >
      {children}
    </div>,
    document.body
  );
}
