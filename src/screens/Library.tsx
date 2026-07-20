import { useEffect, useState } from "react";
import type { BibleApp } from "../useBibleApp";
import { chapterVersesOf } from "../useBibleApp";
import { bookMeta, cachedBook, displayRef, loadBook, parseRefKey } from "../bible";
import { C, SERIF, CARD_SHADOW } from "../theme";

const kicker: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: ".14em",
  color: C.gold,
};

const cardBox: React.CSSProperties = {
  background: "#fff",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 22,
  padding: "26px 30px",
  boxShadow: CARD_SHADOW,
};

const smallOpen: React.CSSProperties = {
  border: "1px solid rgba(22,34,46,.14)",
  background: "#fff",
  fontSize: 12,
  fontWeight: 600,
  padding: "7px 13px",
  borderRadius: 999,
  whiteSpace: "nowrap",
  cursor: "pointer",
  color: C.navy,
};

const removeBtn: React.CSSProperties = {
  border: "none",
  background: "none",
  fontSize: 12,
  fontWeight: 600,
  color: C.faint,
  cursor: "pointer",
};

/** Look up a verse's text from cached book data, if available. */
function verseText(key: string): string {
  const r = parseRefKey(key);
  if (!r) return "";
  const b = cachedBook(r.bookId);
  return b?.chapters[r.chapter - 1]?.[r.verse - 1] ?? "";
}

function refLabel(key: string): string {
  const r = parseRefKey(key);
  return r ? displayRef(r) : key;
}

export function Library({ app }: { app: BibleApp }) {
  const { s, actions } = app;
  const [, force] = useState(0);
  const bms = Object.keys(s.bookmarks);
  const nts = Object.keys(s.notes);

  // Ensure books referenced by saved verses/notes are loaded so we can show
  // excerpts even after a reload (only the reading book is preloaded).
  useEffect(() => {
    const ids = new Set<string>();
    for (const k of [...bms, ...nts]) {
      const r = parseRefKey(k);
      if (r && !cachedBook(r.bookId)) ids.add(r.bookId);
    }
    let alive = true;
    ids.forEach((id) => loadBook(id).then(() => alive && force((n) => n + 1)).catch(() => {}));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bms.length, nts.length]);

  const bookName = bookMeta(s.bookId)?.name ?? "";
  const chapterLen = chapterVersesOf(s).length;
  const progressPct = chapterLen ? Math.round(((s.vi + 1) / chapterLen) * 100) + "%" : "0%";

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 20px 0" }}>
      <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 32, margin: 0 }}>My library</h2>

      {/* progress */}
      <div style={{ ...cardBox, marginTop: 20 }}>
        <div style={kicker}>READING PROGRESS</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14 }}>
          <div style={{ fontFamily: SERIF, fontSize: 22 }}>
            {bookName} {s.chapter}
          </div>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(22,34,46,.08)", overflow: "hidden" }}>
            <div style={{ height: 6, borderRadius: 3, background: C.goldBar, width: progressPct }} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.muted }}>{progressPct}</div>
        </div>
      </div>

      {/* saved verses */}
      <div style={{ ...cardBox, marginTop: 16 }}>
        <div style={kicker}>SAVED VERSES</div>
        {bms.length === 0 && (
          <div style={{ fontSize: 14, color: C.faint, marginTop: 12 }}>
            No saved verses yet. Tap &ldquo;Save&rdquo; on any verse while reading.
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
          {bms.map((key) => {
            const full = verseText(key);
            const excerpt = full ? full.slice(0, 90) + (full.length > 90 ? "…" : "") : "";
            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: "1px solid rgba(22,34,46,.06)",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.gold }}>{refLabel(key)}</div>
                  {excerpt && (
                    <div style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.5, marginTop: 2 }}>
                      &ldquo;{excerpt}&rdquo;
                    </div>
                  )}
                </div>
                <button style={smallOpen} onClick={() => actions.openRefKey(key)}>
                  Open
                </button>
                <button className="be-remove" style={removeBtn} onClick={() => actions.removeBookmark(key)}>
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* notes */}
      <div style={{ ...cardBox, marginTop: 16 }}>
        <div style={kicker}>NOTES</div>
        {nts.length === 0 && (
          <div style={{ fontSize: 14, color: C.faint, marginTop: 12 }}>
            No notes yet. Use &ldquo;Add note&rdquo; on any verse.
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
          {nts.map((key) => (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "10px 0",
                borderBottom: "1px solid rgba(22,34,46,.06)",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.gold }}>{refLabel(key)}</div>
                <div style={{ fontSize: 14, lineHeight: 1.55, marginTop: 3, color: C.bodyInk, whiteSpace: "pre-wrap" }}>
                  {s.notes[key]}
                </div>
              </div>
              <button style={smallOpen} onClick={() => actions.openRefKey(key)}>
                Open
              </button>
              <button className="be-remove" style={removeBtn} onClick={() => actions.removeNote(key)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
