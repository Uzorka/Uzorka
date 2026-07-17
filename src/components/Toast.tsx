import type { BibleApp } from "../useBibleApp";
import { C } from "../theme";

export function Toast({ app }: { app: BibleApp }) {
  const { s } = app;
  if (!s.toast) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: s.isMobile ? 96 : 28,
        zIndex: 200,
        background: "rgba(22,34,46,.95)",
        color: C.cream,
        fontSize: 13,
        fontWeight: 600,
        padding: "11px 20px",
        borderRadius: 999,
        boxShadow: "0 10px 30px rgba(22,34,46,.3)",
        whiteSpace: "nowrap",
      }}
    >
      {s.toast}
    </div>
  );
}
