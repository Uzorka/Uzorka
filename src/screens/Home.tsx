import type { BibleApp } from "../useBibleApp";
import { BOOKS, TOPICS, VERSE_COUNT, VOTD } from "../data";
import { C, SERIF, CARD_SHADOW } from "../theme";

const QUICK_BOOKS = ["Genesis", "Psalms", "Proverbs", "Matthew", "John", "Romans"];

const sectionTitle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  letterSpacing: "-.3px",
};

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

      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "32px 0 0" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "0 20px" }}>
          <div style={sectionTitle}>Browse the Bible</div>
          <button
            className="be-link"
            onClick={() => actions.go("books")}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              color: C.navy,
              padding: 0,
            }}
          >
            All 66 books &rsaquo;
          </button>
        </div>

        {/* horizontal-scroll book cards */}
        <div
          className="be-hscroll"
          style={{
            display: "flex",
            gap: 12,
            marginTop: 14,
            overflowX: "auto",
            padding: "2px 20px 14px",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {QUICK_BOOKS.map((name) => {
            const book = BOOKS.find((b) => b.name === name);
            const featured = name === "John";
            return (
              <button
                key={name}
                className="be-bookcard"
                onClick={() => actions.openBookNamed(name)}
                style={{
                  flex: "0 0 auto",
                  width: 132,
                  border: "none",
                  background: "#fff",
                  borderRadius: 18,
                  padding: "18px 16px",
                  cursor: "pointer",
                  textAlign: "left",
                  boxShadow: CARD_SHADOW,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: featured ? C.navy : C.chipCream,
                    color: featured ? "#e7d5a4" : C.gold,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: SERIF,
                    fontSize: 19,
                    fontWeight: 600,
                  }}
                >
                  {name[0]}
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>{name}</span>
                  <span style={{ fontSize: 12, color: C.faint }}>{book?.chapters} chapters</span>
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "0 20px", marginTop: 22 }}>
          <div style={sectionTitle}>Popular topics</div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: s.isMobile ? "1fr 1fr" : "repeat(5,1fr)",
            gap: 10,
            marginTop: 14,
            padding: "0 20px",
          }}
        >
          {TOPICS.map((name) => (
            <button
              key={name}
              className="be-topiccard"
              onClick={() => actions.showToast("Topic pages come with the full version")}
              style={{
                border: "none",
                background: "#fff",
                borderRadius: 16,
                padding: "15px 16px",
                cursor: "pointer",
                textAlign: "left",
                boxShadow: "0 1px 2px rgba(22,34,46,.05),0 4px 14px rgba(22,34,46,.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: C.ink,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {name}
              </span>
              <span style={{ fontSize: 15, color: C.goldBar }}>&rsaquo;</span>
            </button>
          ))}
        </div>

        <div style={{ fontSize: 12, color: C.faint, marginTop: 30, padding: "0 20px" }}>
          Prototype seeded with the Gospel of John, chapter 1 (KJV, public domain).
        </div>
      </div>
    </>
  );
}
