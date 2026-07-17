import type { BibleApp, Screen } from "../useBibleApp";
import { C, SERIF } from "../theme";

type MTab = { label: string; screen: Screen; active: Screen[]; glyph: string };

const TABS: MTab[] = [
  { label: "Home", screen: "home", active: ["home"], glyph: "⌂" },
  { label: "Bible", screen: "books", active: ["books", "chapters"], glyph: "❖" },
  { label: "Read", screen: "reader", active: ["reader", "chapter", "done"], glyph: "¶" },
  { label: "Library", screen: "library", active: ["library"], glyph: "♡" },
];

export function MobileTabs({ app }: { app: BibleApp }) {
  const { s, actions } = app;
  if (!s.isMobile) return null;
  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 80,
        backdropFilter: "blur(20px) saturate(1.8)",
        WebkitBackdropFilter: "blur(20px) saturate(1.8)",
        background: "rgba(246,244,239,.9)",
        borderTop: "1px solid rgba(22,34,46,.08)",
        display: "flex",
        justifyContent: "space-around",
        padding: "8px 8px 14px",
      }}
    >
      {TABS.map((t) => {
        const color = t.active.includes(s.screen) ? C.navy : C.faint;
        return (
          <button
            key={t.label}
            onClick={() => actions.go(t.screen)}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "6px 14px",
              minWidth: 64,
            }}
          >
            <span style={{ fontFamily: SERIF, fontSize: 17, color }}>{t.glyph}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
