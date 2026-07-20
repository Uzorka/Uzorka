import type { BibleApp, Screen } from "../useBibleApp";
import { C } from "../theme";

type MTab = { label: string; screen: Screen; active: Screen[]; d: string };

// SVG icon paths (24x24 viewBox), stroked.
const TABS: MTab[] = [
  { label: "Home", screen: "home", active: ["home"], d: "M3 11.5 L12 4 L21 11.5 M5.5 9.8 V20 H18.5 V9.8" },
  {
    label: "Bible",
    screen: "books",
    active: ["books", "chapters"],
    d: "M4 5 A2 2 0 0 1 6 3 H20 V19 H6 A2 2 0 0 0 4 21 Z M4 19 A2 2 0 0 1 6 17 H20 M12 7 V13 M9.5 9.5 H14.5",
  },
  { label: "Read", screen: "reader", active: ["reader", "chapter", "done"], d: "M4 6 H20 M4 11 H20 M4 16 H13" },
  { label: "Library", screen: "library", active: ["library"], d: "M6 3 H18 V21 L12 16.5 L6 21 Z" },
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
        const active = t.active.includes(s.screen);
        const color = active ? C.navy : "#6b7480";
        return (
          <button
            key={t.label}
            onClick={() => actions.go(t.screen)}
            aria-label={t.label}
            aria-current={active ? "page" : undefined}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "6px 14px",
              minWidth: 64,
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 28,
                borderRadius: 999,
                background: active ? "#e9e1cd" : "transparent",
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={color}
                strokeWidth={active ? 2.4 : 2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={t.d} />
              </svg>
            </span>
            <span style={{ fontSize: 11, fontWeight: active ? 700 : 600, color }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
