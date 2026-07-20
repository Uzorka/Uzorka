import type { BibleApp } from "../useBibleApp";
import { bookMeta } from "../bible";
import { C, SERIF } from "../theme";

export function Chapters({ app }: { app: BibleApp }) {
  const { s, actions } = app;
  const meta = bookMeta(s.browseBookId);
  if (!meta) return null;
  const onThisBook = s.bookId === meta.id;

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
      <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 32, margin: "10px 0 4px" }}>
        {meta.name}
      </h2>
      <div style={{ fontSize: 14, color: C.muted }}>
        {meta.chapters} {meta.chapters === 1 ? "chapter" : "chapters"} ·{" "}
        {meta.testament === "OT" ? "Old Testament" : "New Testament"}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(56px,1fr))",
          gap: 10,
          marginTop: 24,
          maxWidth: 620,
        }}
      >
        {Array.from({ length: meta.chapters }, (_, i) => {
          const n = i + 1;
          const current = onThisBook && s.chapter === n;
          return (
            <button
              key={n}
              className="be-chapbtn"
              onClick={() => actions.openChapter(n)}
              style={{
                border: "1px solid rgba(22,34,46,.14)",
                background: current ? C.navy : "#fff",
                color: current ? C.cream : C.ink,
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
    </div>
  );
}
