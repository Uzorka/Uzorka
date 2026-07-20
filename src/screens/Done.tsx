import type { BibleApp } from "../useBibleApp";
import { isSeed } from "../useBibleApp";
import { QUIZ, SUMMARY } from "../data";
import { bookMeta, BOOK_IDS } from "../bible";
import { C, SERIF, WHITE_CARD } from "../theme";

const kicker: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: ".14em",
  color: C.gold,
};

function Bullets({ items }: { items: string[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
      {items.map((t, i) => (
        <div key={i} style={{ fontSize: 14, lineHeight: 1.5, color: C.bodyInk, display: "flex", gap: 8 }}>
          <span style={{ color: C.goldBar }}>&bull;</span>
          <span>{t}</span>
        </div>
      ))}
    </div>
  );
}

function nextChapterLabel(bookId: string, chapter: number): string | null {
  const meta = bookMeta(bookId);
  if (!meta) return null;
  if (chapter < meta.chapters) return `${meta.name} ${chapter + 1}`;
  const bi = BOOK_IDS.indexOf(bookId) + 1;
  if (bi < BOOK_IDS.length) return `${bookMeta(BOOK_IDS[bi])!.name} 1`;
  return null;
}

const outlineBtn: React.CSSProperties = {
  border: "1px solid rgba(22,34,46,.16)",
  background: "#fff",
  color: C.navy,
  fontSize: 15,
  fontWeight: 600,
  padding: "16px 24px",
  borderRadius: 16,
  cursor: "pointer",
};
const primaryBtn: React.CSSProperties = {
  flex: 1,
  border: "none",
  background: C.navy,
  color: C.cream,
  fontSize: 15,
  fontWeight: 600,
  padding: "16px 24px",
  borderRadius: 16,
  cursor: "pointer",
};

export function Done({ app }: { app: BibleApp }) {
  const { s, actions } = app;
  const bookName = bookMeta(s.bookId)?.name ?? "";
  const grid2 = s.isMobile ? "1fr" : "1fr 1fr";
  const nextLabel = nextChapterLabel(s.bookId, s.chapter);

  const footerNav = (
    <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
      <button className="be-outline" onClick={actions.readAgain} style={outlineBtn}>
        Read again
      </button>
      {nextLabel && (
        <button className="be-primary" onClick={actions.nextChapter} style={primaryBtn}>
          Continue to {nextLabel} &rsaquo;
        </button>
      )}
    </div>
  );

  // Rich summary + quiz only for the seeded chapter (John 1).
  if (!isSeed(s.bookId, s.chapter)) {
    return (
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px 0" }}>
        <div
          style={{
            background: C.navy,
            color: C.cream,
            borderRadius: 24,
            padding: "40px 38px",
            boxShadow: "0 16px 40px rgba(22,34,46,.2)",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".16em", color: C.nightGold }}>
            CHAPTER COMPLETE
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 34, marginTop: 10 }}>
            Well done &mdash; you finished {bookName} {s.chapter}.
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.65, marginTop: 14, color: "rgba(246,244,239,.85)", textWrap: "pretty" }}>
            Keep going one chapter at a time. Use the reader to study any verse in depth, or tap Listen to hear it read
            aloud.
          </div>
        </div>
        {footerNav}
      </div>
    );
  }

  const picks = s.quizPicks;
  const score = QUIZ.reduce((n, q, i) => n + (picks[i] === q.a ? 1 : 0), 0);
  const people = [...SUMMARY.people, ...SUMMARY.places];

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px 0" }}>
      {/* hero */}
      <div
        style={{
          background: C.navy,
          color: C.cream,
          borderRadius: 24,
          padding: "40px 38px",
          boxShadow: "0 16px 40px rgba(22,34,46,.2)",
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".16em", color: C.nightGold }}>
          CHAPTER COMPLETE
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 34, marginTop: 10 }}>
          Well done &mdash; you finished {bookName} {s.chapter}.
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.65, marginTop: 14, color: "rgba(246,244,239,.85)", textWrap: "pretty" }}>
          {SUMMARY.message}
        </div>
      </div>

      {/* summary */}
      <div style={{ ...WHITE_CARD, padding: "30px 34px", marginTop: 16 }}>
        <div style={kicker}>MAIN THEME</div>
        <div style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.5, marginTop: 8, textWrap: "pretty" }}>
          {SUMMARY.theme}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: grid2, gap: 24, marginTop: 24 }}>
          <div>
            <div style={kicker}>KEY EVENTS</div>
            <Bullets items={SUMMARY.events} />
          </div>
          <div>
            <div style={kicker}>LESSONS LEARNED</div>
            <Bullets items={SUMMARY.lessons} />
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <div style={kicker}>IMPORTANT PEOPLE &amp; PLACES</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {people.map((p) => (
              <div
                key={p}
                style={{
                  background: C.chipCream,
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "7px 14px",
                  borderRadius: 999,
                  color: C.chipInk,
                }}
              >
                {p}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <div style={kicker}>PROMISES FROM GOD</div>
          <Bullets items={SUMMARY.promises} />
        </div>

        <div style={{ marginTop: 24, background: C.lessonBg, borderRadius: 16, padding: "18px 20px" }}>
          <div style={kicker}>A SHORT PRAYER</div>
          <div
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 16,
              lineHeight: 1.6,
              marginTop: 8,
              color: C.lessonInk,
              textWrap: "pretty",
            }}
          >
            {SUMMARY.prayer}
          </div>
        </div>
      </div>

      {/* quiz */}
      <div style={{ ...WHITE_CARD, padding: "30px 34px", marginTop: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Quick quiz</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Five questions on {bookName} {s.chapter}.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 20 }}>
          {QUIZ.map((q, qi) => (
            <div key={qi}>
              <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.45 }}>
                {qi + 1}. {q.q}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
                {q.o.map((o, oi) => {
                  let bd: string = "rgba(22,34,46,.14)";
                  let bg: string = C.panelBg;
                  let fg: string = C.ink;
                  if (!s.quizDone && picks[qi] === oi) {
                    bd = C.navy;
                    bg = "#eef2f6";
                    fg = C.navy;
                  }
                  if (s.quizDone) {
                    if (oi === q.a) {
                      bd = "#7a9a6d";
                      bg = "#eef4ea";
                      fg = "#3c5a32";
                    } else if (picks[qi] === oi) {
                      bd = "#c08a8a";
                      bg = "#f7ecec";
                      fg = "#8a3c3c";
                    }
                  }
                  return (
                    <button
                      key={oi}
                      className="be-chapbtn"
                      onClick={() => actions.setPick(qi, oi)}
                      style={{
                        textAlign: "left",
                        border: `1px solid ${bd}`,
                        background: bg,
                        color: fg,
                        fontSize: 14,
                        padding: "11px 15px",
                        borderRadius: 12,
                        cursor: "pointer",
                      }}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
              {s.quizDone && (
                <div style={{ fontSize: 13, color: C.muted, marginTop: 8, lineHeight: 1.5 }}>{q.e}</div>
              )}
            </div>
          ))}
        </div>

        {s.quizDone ? (
          <div
            style={{
              marginTop: 22,
              background: C.lessonBg,
              borderRadius: 16,
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontFamily: SERIF, fontSize: 20, color: C.lessonInk }}>You scored {score} of 5</div>
            <button
              onClick={actions.retryQuiz}
              style={{
                border: "1px solid rgba(22,34,46,.2)",
                background: "#fff",
                fontSize: 13,
                fontWeight: 600,
                padding: "9px 18px",
                borderRadius: 999,
                whiteSpace: "nowrap",
                cursor: "pointer",
                color: C.navy,
              }}
            >
              Retry quiz
            </button>
          </div>
        ) : (
          <button
            className="be-primary"
            onClick={actions.submitQuiz}
            style={{
              marginTop: 22,
              border: "none",
              background: C.navy,
              color: C.cream,
              fontSize: 14,
              fontWeight: 600,
              padding: "12px 26px",
              borderRadius: 999,
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            Check answers
          </button>
        )}
      </div>

      {footerNav}
    </div>
  );
}
