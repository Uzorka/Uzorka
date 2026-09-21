import { useCallback, useEffect, useState } from "react";

/**
 * Hash routing, deliberately dependency-free.
 *
 * Hash URLs mean every screen is linkable, the Back button works, and a reload
 * lands where you were — with no server rewrite rules. Routes:
 *
 *   #/                        home
 *   #/shop                    catalogue           (?c=category&s=sort)
 *   #/p/:slug                 product
 *   #/box                     Build Your Box
 *   #/meals                   Shop by Meal
 *   #/meals/:slug             meal builder
 *   #/promise                 Fresh Promise
 *   #/cart                    cart (phone full screen)
 *   #/checkout                checkout
 *   #/order/:no               order tracking
 *   #/orders                  order history
 *   #/saved                   favourites
 *   #/account                 account
 *   #/admin                   admin dashboard
 */

export type Route = { path: string[]; query: URLSearchParams; raw: string };

function parse(): Route {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const [pathPart, queryPart = ""] = raw.split("?");
  return {
    path: pathPart.split("/").filter(Boolean),
    query: new URLSearchParams(queryPart),
    raw,
  };
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parse);
  useEffect(() => {
    const on = () => setRoute(parse());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}

/** Remembers scroll position per route so Back returns you to your place in a
 *  long catalogue instead of the top of it. */
const scrollMemory = new Map<string, number>();

export function navigate(to: string, opts: { replace?: boolean } = {}): void {
  const from = window.location.hash.replace(/^#/, "") || "/";
  scrollMemory.set(from, window.scrollY);
  const next = `#${to.startsWith("/") ? to : `/${to}`}`;
  if (next === window.location.hash) return;
  if (opts.replace) window.history.replaceState(null, "", next);
  else window.history.pushState(null, "", next);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

export function restoreScroll(raw: string, isPop: boolean): void {
  const y = isPop ? scrollMemory.get(raw) ?? 0 : 0;
  window.scrollTo({ top: y, behavior: "auto" });
}

export function useNavigate() {
  return useCallback((to: string, opts?: { replace?: boolean }) => {
    navigate(to, opts);
  }, []);
}

export function back(): void {
  if (window.history.length > 1) window.history.back();
  else navigate("/");
}
