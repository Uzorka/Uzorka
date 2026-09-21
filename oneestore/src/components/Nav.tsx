import { useRef } from "react";
import {
  IconBasket,
  IconBox,
  IconBowl,
  IconChevronRight,
  IconFish,
  IconHeart,
  IconHome,
  IconMenu,
  IconMoon,
  IconReceipt,
  IconSearch,
  IconShield,
  IconSun,
  IconUser,
  Logo,
} from "../design/icons";
import { useIsMobile, useMediaQuery } from "../lib/hooks";
import { useNavigate, useRoute } from "../lib/router";
import { useCartTotals, useStore } from "../state/store";
import { Button, IconButton } from "./Button";
import { BottomSheet } from "./Overlays";
import { GlassSurface } from "./Surface";

/* ============================================================================
   Cart button + badge.

   The badge is the app's main piece of ambient feedback: it bumps every time
   something lands in the basket, keyed on a counter so the animation replays
   even when the number does not change visibly.
   ========================================================================== */

function CartButton({ variant }: { variant: "nav" | "bottom" }) {
  const { openOverlay, cartAnchor, cartPulse } = useStore();
  const { count } = useCartTotals();
  const ref = useRef<HTMLButtonElement | null>(null);
  const isMobile = useIsMobile();
  const nav = useNavigate();

  return (
    <button
      ref={(el) => {
        ref.current = el;
        // Registered once so quick-add knows where to throw the ghost.
        if (variant === (isMobile ? "bottom" : "nav")) cartAnchor.current = el;
      }}
      type="button"
      className={variant === "nav" ? "navbtn navbtn--cart" : "tabbtn"}
      aria-label={
        count === 0 ? "Basket, empty" : `Basket, ${count} item${count === 1 ? "" : "s"}`
      }
      onClick={() => {
        // Phones get a full screen; larger screens get a drawer over the page.
        if (isMobile) nav("/cart");
        else openOverlay({ kind: "cart" });
      }}
    >
      <span className="navbtn__icon">
        <IconBasket size={variant === "nav" ? 21 : 23} />
        {count > 0 && (
          <span key={cartPulse} className="cartbadge num" aria-hidden="true">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </span>
      {variant === "bottom" && <span className="tabbtn__label">Basket</span>}
      {variant === "nav" && <span className="navbtn__label">Basket</span>}
    </button>
  );
}

/* ============================================================================
   TopNav — desktop. Glass, sticky, and it stays out of the way: logo, the four
   destinations that matter, then search, account and basket.
   ========================================================================== */

const LINKS = [
  { to: "/shop", label: "Shop" },
  { to: "/box", label: "Build Your Box" },
  { to: "/meals", label: "Shop by Meal" },
  { to: "/promise", label: "Fresh Promise" },
];

export function TopNav() {
  const route = useRoute();
  const nav = useNavigate();
  const { openOverlay, state, dispatch } = useStore();
  const isMobile = useIsMobile();
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const here = `/${route.path[0] ?? ""}`;
  const theme = state.prefs.theme;
  // What the visitor is actually looking at, which is what the glyph should
  // show — "system" on a dark device is dark, whatever the stored value says.
  const resolvedDark = theme === "dark" || (theme === "system" && prefersDark);

  const cycleTheme = () => {
    const next = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
    dispatch({ type: "prefs/patch", patch: { theme: next } });
  };

  return (
    <GlassSurface as="header" tier="nav" className="topnav">
      <div className="topnav__inner">
        <a
          href="#/"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            nav("/");
          }}
        >
          <Logo size={isMobile ? 28 : 32} />
          <span className="brand__word">
            ONEE<span className="brand__accent">STORE</span>
          </span>
        </a>

        {!isMobile && (
          <nav className="topnav__links" aria-label="Main">
            {LINKS.map((l) => (
              <a
                key={l.to}
                href={`#${l.to}`}
                className={`navlink ${here === l.to ? "is-on" : ""}`}
                aria-current={here === l.to ? "page" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  nav(l.to);
                }}
              >
                {l.label}
                <span className="navlink__rule" aria-hidden="true" />
              </a>
            ))}
          </nav>
        )}

        <div className="topnav__actions">
          {!isMobile && (
            <>
              {/* Two search affordances, one shown at a time by width: the wide
                  field once there is room for it, the icon button below that.
                  Keeping both in the DOM lets CSS make the call at any width
                  without a second JS breakpoint to keep in sync. */}
              <button
                type="button"
                className="navsearch"
                onClick={() => openOverlay({ kind: "search" })}
              >
                <IconSearch size={18} />
                <span>Search seafood</span>
                <kbd className="navsearch__kbd">/</kbd>
              </button>
              <IconButton
                label="Search seafood"
                variant="plain"
                className="topnav__searchicon"
                onClick={() => openOverlay({ kind: "search" })}
              >
                <IconSearch size={20} />
              </IconButton>

              <IconButton
                label={
                  theme === "system"
                    ? `Appearance: follows your device (${resolvedDark ? "dark" : "light"})`
                    : theme === "dark"
                      ? "Appearance: dark"
                      : "Appearance: light"
                }
                variant="plain"
                onClick={cycleTheme}
              >
                {resolvedDark ? <IconMoon size={19} /> : <IconSun size={19} />}
              </IconButton>

              <button
                type="button"
                className="navbtn"
                onClick={() => nav("/account")}
                aria-label="Your account"
              >
                <span className="navbtn__icon">
                  <IconUser size={20} />
                </span>
                <span className="navbtn__label">Account</span>
              </button>
            </>
          )}

          {isMobile && (
            <IconButton
              label="Search seafood"
              variant="plain"
              onClick={() => openOverlay({ kind: "search" })}
            >
              <IconSearch size={20} />
            </IconButton>
          )}

          {isMobile ? (
            <IconButton
              label="More"
              variant="plain"
              onClick={() => openOverlay({ kind: "menu" })}
            >
              <IconMenu size={20} />
            </IconButton>
          ) : (
            <CartButton variant="nav" />
          )}
        </div>
      </div>
    </GlassSurface>
  );
}

/* ============================================================================
   BottomNav — mobile. Five destinations in the thumb zone, floating over the
   content on glass. Deliberately not the desktop nav shrunk down: Build Your Box
   and Fresh Promise live in the More sheet, because five is the most a thumb row
   can carry without becoming a guessing game.
   ========================================================================== */

const TABS = [
  { to: "/", label: "Home", icon: IconHome },
  { to: "/shop", label: "Shop", icon: IconFish },
  { to: "search", label: "Search", icon: IconSearch },
  { to: "/orders", label: "Orders", icon: IconReceipt },
] as const;

export function BottomNav() {
  const route = useRoute();
  const nav = useNavigate();
  const { openOverlay } = useStore();
  const here = `/${route.path[0] ?? ""}`;

  return (
    <GlassSurface as="nav" tier="floating" className="bottomnav" aria-label="Main">
      {TABS.map((t) => {
        const on = t.to === "search" ? false : here === t.to;
        const Icon = t.icon;
        return (
          <button
            key={t.label}
            type="button"
            className={`tabbtn ${on ? "is-on" : ""}`}
            aria-current={on ? "page" : undefined}
            onClick={() => {
              if (t.to === "search") openOverlay({ kind: "search" });
              else nav(t.to);
            }}
          >
            <span className="tabbtn__icon">
              <Icon size={23} />
              {on && <span className="tabbtn__glow" aria-hidden="true" />}
            </span>
            <span className="tabbtn__label">{t.label}</span>
          </button>
        );
      })}
      <CartButton variant="bottom" />
    </GlassSurface>
  );
}

/* ============================================================================
   MoreSheet — the rest of the navigation on phones. A sheet rather than a
   hamburger drawer, so it arrives from the thumb and leaves the same way.
   ========================================================================== */

export function MoreSheet() {
  const { overlay, closeOverlay, state, dispatch } = useStore();
  const nav = useNavigate();
  const open = overlay.kind === "menu";

  const go = (to: string) => {
    closeOverlay();
    nav(to);
  };

  const rows = [
    { to: "/box", label: "Build Your Box", note: "Mix your own, pay by weight", icon: <IconBox size={20} /> },
    { to: "/meals", label: "Shop by Meal", note: "Okra, pasta, pepper soup, boil", icon: <IconBowl size={20} /> },
    { to: "/promise", label: "Fresh Promise", note: "How we keep it fresh", icon: <IconShield size={20} /> },
    { to: "/saved", label: "Saved", note: "Seafood you liked", icon: <IconHeart size={20} /> },
    { to: "/orders", label: "Your orders", note: "Track and order again", icon: <IconReceipt size={20} /> },
    { to: "/account", label: "Account", note: "Details and addresses", icon: <IconUser size={20} /> },
  ];

  const theme = state.prefs.theme;

  return (
    <BottomSheet open={open} onClose={closeOverlay} title="ONEESTORE">
      <ul className="menulist">
        {rows.map((r) => (
          <li key={r.to}>
            <button type="button" className="menurow" onClick={() => go(r.to)}>
              <span className="menurow__icon">{r.icon}</span>
              <span className="menurow__text">
                <span className="menurow__label">{r.label}</span>
                <span className="menurow__note">{r.note}</span>
              </span>
              <IconChevronRight size={18} className="menurow__chev" />
            </button>
          </li>
        ))}
      </ul>

      <div className="menufoot">
        <div className="menufoot__theme">
          <span className="menufoot__label">Appearance</span>
          <div className="seg seg--sm" role="group" aria-label="Appearance">
            {(["system", "light", "dark"] as const).map((t) => (
              <button
                key={t}
                type="button"
                className={`seg__item ${theme === t ? "is-on" : ""}`}
                aria-pressed={theme === t}
                onClick={() => dispatch({ type: "prefs/patch", patch: { theme: t } })}
              >
                {t === "system" ? "Auto" : t === "light" ? "Light" : "Dark"}
              </button>
            ))}
          </div>
        </div>
        <Button variant="quiet" block onClick={() => go("/admin")}>
          Staff view
        </Button>
      </div>
    </BottomSheet>
  );
}

/** Small page-level breadcrumb / back affordance for deep screens. */
export function BackBar({
  label,
  to,
  trailing,
}: {
  label: string;
  to?: string;
  trailing?: React.ReactNode;
}) {
  const nav = useNavigate();
  return (
    <div className="backbar">
      <button
        type="button"
        className="backbar__btn"
        onClick={() => (to ? nav(to) : window.history.back())}
      >
        <IconChevronRight size={17} className="backbar__chev" />
        <span>{label}</span>
      </button>
      {trailing}
    </div>
  );
}

/** Announces the basket count to assistive tech outside the visual badge. */
export function CartAnnouncer() {
  const { count } = useCartTotals();
  return (
    <p className="sr-only" role="status" aria-live="polite">
      {count === 0 ? "Basket empty" : `${count} item${count === 1 ? "" : "s"} in basket`}
    </p>
  );
}

export { CartButton };
