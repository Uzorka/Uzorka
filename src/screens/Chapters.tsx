import type { BibleApp } from "../useBibleApp";
import { C, SERIF } from "../theme";

export function Chapters({ app }: { app: BibleApp }) {
  const { actions } = app;
  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "36px 20px 0" }}>
      <button
        className="be-link-navy"
        onClick={() => actions.go("books")}
        style={{
          border: "none",
          background: "none",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 600,
          color: C.muted,
          padding: 0,
        }}
      >
        &lsaquo; All books
      </button>
      <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 32, margin: "10px 0 4px" }}>John</h2>
      <div style={{ fontSize: 14, color: C.muted }}>21 chapters · Gospel · New Testament</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(56px,1fr))",
          gap: 10,
          marginTop: 24,
          maxWidth: 620,
        }}
      >
        {Array.from({ length: 21 }, (_, i) => {
          const n = i + 1;
          const first = i === 0;
          return (
            <button
              key={n}
              className="be-chapbtn"
              onClick={() => actions.openChapter(n)}
              style={{
                border: "1px solid rgba(22,34,46,.14)",
                background: first ? C.navy : "#fff",
                color: first ? C.cream : C.ink,
                fontSize: 15,
                fontWeight: 600,
                height: 52,
                borderRadius: 14,
                cursor: "pointer",
              }}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: 13, color: C.faint, marginTop: 18 }}>
        Chapter 1 includes full text and verse-by-verse study content.
      </div>
    </div>
  );
}
