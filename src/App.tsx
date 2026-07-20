import { useEffect, useRef } from "react";
import { useBibleApp, type AppState, type RouteNav } from "./useBibleApp";
import { C, SANS } from "./theme";
import { Header } from "./components/Header";
import { MobileTabs } from "./components/MobileTabs";
import { Toast } from "./components/Toast";
import { Home } from "./screens/Home";
import { Books } from "./screens/Books";
import { Chapters } from "./screens/Chapters";
import { Reader } from "./screens/Reader";
import { Chapter } from "./screens/Chapter";
import { Done } from "./screens/Done";
import { Library } from "./screens/Library";
import { Listen } from "./screens/Listen";

// ---- hash routing --------------------------------------------------------
// URLs are hash-based (#/read/john/3/16) so the app works as static files on
// any host (Vercel, GitHub Pages) with no server rewrites, and pathname stays
// constant so relative asset fetches keep resolving.

function stateToHash(s: AppState): string {
  switch (s.screen) {
    case "home":
      return "#/";
    case "books":
      return "#/books";
    case "library":
      return "#/library";
    case "chapters":
      return `#/book/${s.browseBookId}`;
    case "reader":
      return `#/read/${s.bookId}/${s.chapter}/${s.vi + 1}`;
    case "chapter":
      return `#/chapter/${s.bookId}/${s.chapter}`;
    case "listen":
      return `#/listen/${s.bookId}/${s.chapter}/${s.vi + 1}`;
    case "done":
      return `#/done/${s.bookId}/${s.chapter}`;
  }
}

function parseHash(hash: string): RouteNav | null {
  const parts = hash.replace(/^#/, "").split("/").filter(Boolean);
  const [head, a, b, c] = parts;
  const num = (x?: string) => {
    const n = parseInt(x ?? "", 10);
    return Number.isFinite(n) ? n : undefined;
  };
  if (parts.length === 0) return { screen: "home" };
  switch (head) {
    case "books":
      return { screen: "books" };
    case "library":
      return { screen: "library" };
    case "book":
      return a ? { screen: "chapters", bookId: a } : null;
    case "read":
      return a ? { screen: "reader", bookId: a, chapter: num(b), verse: num(c) } : null;
    case "chapter":
      return a ? { screen: "chapter", bookId: a, chapter: num(b) } : null;
    case "listen":
      return a ? { screen: "listen", bookId: a, chapter: num(b), verse: num(c) } : null;
    case "done":
      return a ? { screen: "done", bookId: a, chapter: num(b) } : null;
    default:
      return { screen: "home" };
  }
}

/** Context key excluding the verse — verse-only changes replace history. */
function contextKey(s: AppState): string {
  return `${s.screen}|${s.bookId}|${s.chapter}|${s.browseBookId}`;
}

export default function App() {
  const app = useBibleApp();
  const { s, actions } = app;

  // Apply a deep link on first load.
  useEffect(() => {
    const nav = parseHash(window.location.hash);
    if (nav && nav.screen !== "home") actions.applyRoute(nav);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Back/forward and manual URL edits.
  useEffect(() => {
    const onNav = () => {
      const nav = parseHash(window.location.hash);
      if (nav) actions.applyRoute(nav);
    };
    window.addEventListener("popstate", onNav);
    window.addEventListener("hashchange", onNav);
    return () => {
      window.removeEventListener("popstate", onNav);
      window.removeEventListener("hashchange", onNav);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect state into the URL (pushState avoids the hashchange feedback loop).
  const prevContext = useRef<string | null>(null);
  useEffect(() => {
    const desired = stateToHash(s);
    const current = window.location.hash || "#/";
    if (current !== desired) {
      const ctx = contextKey(s);
      if (prevContext.current === ctx) window.history.replaceState(null, "", desired);
      else window.history.pushState(null, "", desired);
    }
    prevContext.current = contextKey(s);
  }, [s.screen, s.bookId, s.chapter, s.vi, s.browseBookId]);

  // Surface load failures.
  useEffect(() => {
    if (s.loadError) actions.showToast("Couldn’t load that book — check your connection.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.loadError]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.ink,
        fontFamily: SANS,
        paddingBottom: 120,
      }}
    >
      <Header app={app} />

      {s.screen === "home" && <Home app={app} />}
      {s.screen === "books" && <Books app={app} />}
      {s.screen === "chapters" && <Chapters app={app} />}
      {s.screen === "reader" && <Reader app={app} />}
      {s.screen === "chapter" && <Chapter app={app} />}
      {s.screen === "done" && <Done app={app} />}
      {s.screen === "library" && <Library app={app} />}
      {s.screen === "listen" && <Listen app={app} />}

      <MobileTabs app={app} />
      <Toast app={app} />
    </div>
  );
}
