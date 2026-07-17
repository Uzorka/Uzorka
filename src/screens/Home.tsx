import type { BibleApp } from "../useBibleApp";
import { TOPICS, VERSE_COUNT, VOTD } from "../data";
import { C, SERIF, CARD_SHADOW } from "../theme";

const QUICK_BOOKS = ["Genesis", "Psalms", "Proverbs", "Matthew", "John", "Romans"];

const kicker: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: ".14em",
  color: C.gold,
};

const card: React.CSSProperties = {
  background: "#fff",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 20,
  padding: 26,
  boxShadow: CARD_SHADOW,
  display: "flex",
  flexDirection: "column",
};

const pillOutline: React.CSSProperties = {
  border: "1px solid rgba(22,34,46,.16)",
  background: "#fff",
  fontSize: 13,
  fontWeight: 600,
  padding: "8px 15px",
  borderRadius: 999,
  whiteSpace: "nowrap",
  cursor: "pointer",
  color: C.navy,
};

export function Home({ app }: { app: BibleApp }) {
  const { s, actions } = app;
  const verseNum = s.vi + 1;
  const progressPct = Math.round((verseNum / VERSE_COUNT) * 100) + "%";
  const grid2 = s.isMobile ? "1fr" : "1fr 1fr";

  return (
    <>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "64px 20px 20px", textAlign: "center" }}>
        <div style={kicker}>KING JAMES VERSION · GUIDED STUDY</div>
        <h1
          style={{
            fontFamily: SERIF,
            fontWeight: 500,
            fontSize: 46,
            lineHeight: 1.15,
            letterSpacing: "-.5px",
            margin: "14px 0 0",
            textWrap: "balance",
          }}
        >
          Read the Bible. Understand every verse.
        </h1>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.6,
            color: C.muted,
            maxWidth: 560,
            margin: "16px auto 0",
            textWrap: "pretty",
          }}
        >
          Study Scripture one verse at a time with simple explanations, audio narration,
          historical context, and practical lessons.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 26 }}>
          <button
            className="be-primary"
            onClick={actions.startReading}
            style={{
              border: "none",
              background: C.navy,
              color: C.cream,
              fontSize: 15,
              fontWeight: 600,
              padding: "13px 26px",
              borderRadius: 999,
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            Start reading
          </button>
          <button
            className="be-outline"
            onClick={() => actions.go("books")}
            style={{
              border: "1px solid rgba(22,34,46,.18)",
              background: "#fff",
              color: C.ink,
              fontSize: 15,
              fontWeight: 600,
              padding: "13px 26px",
              borderRadius: 999,
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            Explore the Bible
          </button>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1060,
          margin: "0 auto",
          padding: "36px 20px 0",
          display: "grid",
          gridTemplateColumns: grid2,
          gap: 16,
        }}
      >
        {/* Continue reading */}
        <div style={{ ...card, gap: 14 }}>
          <div style={kicker}>CONTINUE READING</div>
          <div style={{ fontFamily: SERIF, fontSize: 26 }}>John 1 : {verseNum}</div>
          <div style={{ height: 6, borderRadius: 3, background: "rgba(22,34,46,.08)", overflow: "hidden" }}>
            <div style={{ height: 6, borderRadius: 3, background: C.goldBar, width: progressPct }} />
          </div>
          <div style={{ fontSize: 13, color: C.muted }}>
            Verse {verseNum} of {VERSE_COUNT} · {progressPct} complete
          </div>
          <div>
            <button
              className="be-primary"
              onClick={() => actions.go("reader")}
              style={{
                border: "none",
                background: C.navy,
                color: C.cream,
                fontSize: 14,
                fontWeight: 600,
                padding: "11px 20px",
                borderRadius: 999,
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              Resume study
            </button>
          </div>
        </div>

        {/* Verse of the day */}
        <div style={{ ...card, gap: 12 }}>
          <div style={kicker}>VERSE OF THE DAY · {VOTD.ref}</div>
          <div style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.55, textWrap: "pretty" }}>
            &ldquo;{VOTD.text}&rdquo;
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: C.muted, textWrap: "pretty" }}>
            {VOTD.s}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
            <button className="be-outline" onClick={actions.playVotd} style={pillOutline}>
              {s.votdPlaying ? "Stop" : "Listen"}
            </button>
            <button className="be-outline" onClick={actions.saveVotd} style={pillOutline}>
              Save
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "28px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Browse the Bible</div>
          <button
            className="be-link"
            onClick={() => actions.go("books")}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              color: C.navy,
            }}
          >
            All 66 books &rsaquo;
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
          {QUICK_BOOKS.map((name) => (
            <button
              key={name}
              className="be-bookpill"
              onClick={() => actions.openBookNamed(name)}
              style={{
                border: "1px solid rgba(22,34,46,.12)",
                background: "#fff",
                fontSize: 14,
                padding: "10px 18px",
                borderRadius: 999,
                whiteSpace: "nowrap",
                cursor: "pointer",
                color: C.ink,
              }}
            >
              {name}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 16, fontWeight: 600, marginTop: 28 }}>Popular topics</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
          {TOPICS.map((name) => (
            <button
              key={name}
              className="be-topic"
              onClick={() => actions.showToast("Topic pages come with the full version")}
              style={{
                border: "none",
                background: C.chipCream,
                fontSize: 13,
                fontWeight: 600,
                padding: "9px 16px",
                borderRadius: 999,
                whiteSpace: "nowrap",
                cursor: "pointer",
                color: C.chipInk,
              }}
            >
              {name}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 12, color: C.faint, marginTop: 30 }}>
          Prototype seeded with the Gospel of John, chapter 1 (KJV, public domain).
        </div>
      </div>
    </>
  );
}
