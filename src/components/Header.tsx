import type { BibleApp, Screen } from "../useBibleApp";
import { C, SERIF } from "../theme";

type Tab = { label: string; screen: Screen; active: Screen[] };

const TABS: Tab[] = [
  { label: "Home", screen: "home", active: ["home"] },
  { label: "Bible", screen: "books", active: ["books", "chapters", "reader", "chapter", "done"] },
  { label: "Library", screen: "library", active: ["library"] },
];

export function Header({ app }: { app: BibleApp }) {
  const { s, actions } = app;
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(20px) saturate(1.8)",
        WebkitBackdropFilter: "blur(20px) saturate(1.8)",
        background: "rgba(246,244,239,.85)",
        borderBottom: "1px solid rgba(22,34,46,.08)",
      }}
    >
      <div
        style={{
          maxWidth: 1060,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "10px 20px",
        }}
      >
        <div
          onClick={() => actions.go("home")}
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: C.navy,
              color: "#e7d5a4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: SERIF,
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            B
          </div>
          <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-.2px" }}>
            Bible Explained
          </div>
        </div>
        {!s.isMobile && (
          <div style={{ display: "flex", gap: 4 }}>
            {TABS.map((t) => {
              const on = t.active.includes(s.screen);
              return (
                <button
                  key={t.label}
                  className="be-navtab"
                  onClick={() => actions.go(t.screen)}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: 14,
                    padding: "8px 10px",
                    borderRadius: 9,
                    color: on ? C.ink : C.muted,
                    fontWeight: on ? 700 : 500,
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        )}
        <div style={{ flex: 1 }} />
        {!s.isMobile ? (
          <button
            className="be-primary"
            onClick={() => actions.go("reader")}
            style={{
              border: "none",
              background: C.navy,
              color: C.cream,
              fontSize: 13,
              fontWeight: 600,
              padding: "9px 16px",
              borderRadius: 999,
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            Continue · John 1:{s.vi + 1}
          </button>
        ) : (
          <div style={{ fontSize: 12, fontWeight: 600, color: C.gold, whiteSpace: "nowrap" }}>
            John 1 : {s.vi + 1}
          </div>
        )}
      </div>
    </div>
  );
}
