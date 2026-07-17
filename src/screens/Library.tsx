import type { BibleApp } from "../useBibleApp";
import { JOHN1, VERSE_COUNT } from "../data";
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

export function Library({ app }: { app: BibleApp }) {
  const { s, actions } = app;
  const progressPct = Math.round(((s.vi + 1) / VERSE_COUNT) * 100) + "%";
  const bms = Object.keys(s.bookmarks);
  const nts = Object.keys(s.notes);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 20px 0" }}>
      <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 32, margin: 0 }}>My library</h2>

      {/* progress */}
      <div style={{ ...cardBox, marginTop: 20 }}>
        <div style={kicker}>READING PROGRESS</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14 }}>
          <div style={{ fontFamily: SERIF, fontSize: 22 }}>John 1</div>
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
          {bms.map((ref) => {
            const n = parseInt(ref.split(":")[1], 10);
            const full = JOHN1[n - 1] || "";
            const excerpt = full.slice(0, 90) + (full.length > 90 ? "…" : "");
            return (
              <div
                key={ref}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: "1px solid rgba(22,34,46,.06)",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.gold }}>{ref}</div>
                  <div style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.5, marginTop: 2 }}>
                    &ldquo;{excerpt}&rdquo;
                  </div>
                </div>
                <button style={smallOpen} onClick={() => actions.openRef(ref)}>
                  Open
                </button>
                <button className="be-remove" style={removeBtn} onClick={() => actions.removeBookmark(ref)}>
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
          {nts.map((ref) => (
            <div
              key={ref}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "10px 0",
                borderBottom: "1px solid rgba(22,34,46,.06)",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.gold }}>{ref}</div>
                <div style={{ fontSize: 14, lineHeight: 1.55, marginTop: 3, color: C.bodyInk, whiteSpace: "pre-wrap" }}>
                  {s.notes[ref]}
                </div>
              </div>
              <button style={smallOpen} onClick={() => actions.openRef(ref)}>
                Open
              </button>
              <button className="be-remove" style={removeBtn} onClick={() => actions.removeNote(ref)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
