import { useEffect } from "react";
import { AddedSheet } from "./components/AddedSheet";
import { CartDrawer } from "./components/CartPanel";
import { CustomizeSheet } from "./components/CustomizeSheet";
import { BottomNav, CartAnnouncer, MoreSheet, TopNav } from "./components/Nav";
import { SearchOverlay } from "./components/SearchOverlay";
import { ToastHost } from "./components/Toast";
import { useRoute } from "./lib/router";
import { useOrderProgress, useStore } from "./state/store";
import { Account } from "./screens/Account";
import { Admin } from "./screens/Admin";
import { BuildBox } from "./screens/BuildBox";
import { CartPage } from "./screens/CartPage";
import { Checkout } from "./screens/Checkout";
import { Home } from "./screens/Home";
import { MealBuilder, Meals } from "./screens/Meals";
import { NotFound } from "./screens/NotFound";
import { OrderTracking, Orders } from "./screens/Orders";
import { ProductPage } from "./screens/Product";
import { Promise as FreshPromise } from "./screens/Promise";
import { Saved } from "./screens/Saved";
import { Shop } from "./screens/Shop";

/**
 * App shell.
 *
 * The chrome is constant — a glass top bar everywhere, a floating bottom bar on
 * phones — and only the screen inside changes. That is what makes navigation
 * feel like moving within one product rather than loading pages.
 *
 * Every overlay is mounted once, here, and driven by the store's single
 * `overlay` value. No screen owns a modal, so two can never fight.
 */
export function App() {
  const route = useRoute();
  const { openOverlay, overlay } = useStore();

  // Live order stages tick forward while the app is open.
  useOrderProgress();

  // "/" opens search from anywhere — the shortcut the nav advertises.
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el as HTMLElement | null)?.isContentEditable;
      if (typing) return;
      if (e.key === "/") {
        e.preventDefault();
        openOverlay({ kind: "search" });
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [openOverlay]);

  // Each navigation starts at the top of the new screen, and the document title
  // follows the route so browser history is readable.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [route.raw]);

  useEffect(() => {
    document.title = `${titleFor(route.path)} — ONEESTORE`;
  }, [route.path]);

  return (
    <div className="app">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <TopNav />
      <main id="main" key={route.raw}>
        <Screen />
      </main>
      <BottomNav />

      {/* Overlays: one of each, driven by the store. */}
      <SearchOverlay />
      <CartDrawer />
      <CustomizeSheet />
      <AddedSheet />
      <MoreSheet />
      <ToastHost />
      <CartAnnouncer />

      {/* Keeps the route in the a11y tree when an overlay is open. */}
      <p className="sr-only" role="status" aria-live="polite">
        {overlay.kind === "none" ? "" : `${overlay.kind} open`}
      </p>
    </div>
  );
}

function Screen() {
  const route = useRoute();
  const [head, second] = route.path;

  switch (head) {
    case undefined:
      return <Home />;
    case "shop":
      return <Shop />;
    case "p":
      return <ProductPage slug={second} />;
    case "box":
      return <BuildBox />;
    case "meals":
      return second ? <MealBuilder slug={second} /> : <Meals />;
    case "promise":
      return <FreshPromise />;
    case "cart":
      return <CartPage />;
    case "checkout":
      return <Checkout />;
    case "order":
      return <OrderTracking no={second} />;
    case "orders":
      return <Orders />;
    case "saved":
      return <Saved />;
    case "account":
      return <Account />;
    case "admin":
      return <Admin />;
    default:
      return <NotFound />;
  }
}

function titleFor(path: string[]): string {
  const map: Record<string, string> = {
    shop: "Shop seafood",
    p: "Product",
    box: "Build Your Box",
    meals: "Shop by Meal",
    promise: "Fresh Promise",
    cart: "Your basket",
    checkout: "Checkout",
    order: "Track your order",
    orders: "Your orders",
    saved: "Saved seafood",
    account: "Your account",
    admin: "Operations",
  };
  return map[path[0] ?? ""] ?? "Fresh seafood, ordered simply";
}
