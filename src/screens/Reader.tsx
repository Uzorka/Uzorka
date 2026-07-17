import type { BibleApp } from "../useBibleApp";
import { EX, JOHN1, VERSE_COUNT } from "../data";
import { refFor } from "../useBibleApp";
import { C, SERIF, WHITE_CARD } from "../theme";
import { Modes } from "../components/Modes";
import { Segmented } from "../components/Segmented";
import { SkeletonLines } from "../components/Skeleton";

const LEVELS = ["Child", "Beginner", "Standard", "Deep"];
const ASK_CHIPS = [
  "What does this verse mean in simple words?",
  "Who is being described here?",
  "Are there different interpretations?",
  "How does this apply to my life today?",
];

const kicker: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: ".14em",
  color: C.gold,
};
const body: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.65,
  marginTop: 8,
  color: C.bodyInk,
  textWrap: "pretty",
};

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 20 }}>
      <div style={kicker}>{label}</div>
      {children}
    </div>
  );
}

export function Reader({ app }: { app: BibleApp }) {
  const { s, actions, settings } = app;
  const vi = s.vi;
  const verseNum = vi + 1;
  const scale = settings.verseTextScale;
  const verseFont = Math.round(29 * scale);
  const progressPct = Math.round((verseNum / VERSE_COUNT) * 100) + "%";
  const ref = refFor(vi);
  const ex = EX[verseNum] || { s: "" };
  const key = vi + "|" + s.level;
  const aiText = s.lvlCache[key];
  const simpleText = s.level === "Standard" ? ex.s || "" : aiText || "";
  const lvlBusy = s.lvlBusy && !simpleText;

  const bmSaved = !!s.bookmarks[ref];
  const people = [...(ex.people || []), ...(ex.places || [])];
  const hasAskAnswer = !!s.askAnswer && !s.askBusy;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 20px 0" }}>
      {/* breadcrumb + modes */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 13, color: C.muted }}>
          <span onClick={() => actions.go("books")} style={{ cursor: "pointer", color: C.navy, fontWeight: 600 }}>
            John
          </span>{" "}
          &rsaquo;{" "}
          <span onClick={() => actions.go("chapters")} style={{ cursor: "pointer", color: C.navy, fontWeight: 600 }}>
            Chapter 1
          </span>{" "}
          &rsaquo; Verse {verseNum}
        </div>
        <Modes app={app} />
      </div>

      {/* progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(22,34,46,.08)", overflow: "hidden" }}>
          <div style={{ height: 4, borderRadius: 2, background: C.goldBar, width: progressPct }} />
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, whiteSpace: "nowrap" }}>
          Verse {verseNum} of {VERSE_COUNT}
        </div>
      </div>

      {/* verse card */}
      <div style={{ ...WHITE_CARD, padding: "34px 34px 26px", marginTop: 16 }}>
        <div style={{ fontFamily: SERIF, fontSize: 15, color: C.goldBar }}>
          John 1 : {verseNum} · KJV
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: verseFont,
            lineHeight: 1.5,
            marginTop: 12,
            textWrap: "pretty",
          }}
        >
          &ldquo;{JOHN1[vi]}&rdquo;
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 22 }}>
          <button className="be-primary" onClick={actions.togglePlay} style={navyPill}>
            {s.playing && s.screen === "reader" ? "■ Stop" : "▶ Listen"}
          </button>
          <button
            className="be-outline-gold"
            onClick={actions.toggleBookmark}
            style={{
              ...outlinePill,
              background: bmSaved ? C.johnBadgeBg : "#fff",
              color: bmSaved ? C.gold : C.navy,
            }}
          >
            {bmSaved ? "✓ Saved" : "Save"}
          </button>
          <button
            className="be-outline"
            onClick={actions.openNote}
            style={{ ...outlinePill, color: C.navy }}
          >
            {s.notes[ref] ? "Edit note" : "Add note"}
          </button>
          <button
            className="be-outline"
            onClick={actions.shareVerse}
            style={{ ...outlinePill, color: C.navy }}
          >
            Share
          </button>
        </div>

        {s.noteOpen && (
          <div style={{ marginTop: 18, borderTop: "1px solid rgba(22,34,46,.08)", paddingTop: 18 }}>
            <textarea
              className="be-input"
              value={s.noteDraft}
              onChange={(e) => actions.setNoteDraft(e.target.value)}
              placeholder="Write a personal note about this verse…"
              style={{
                width: "100%",
                minHeight: 90,
                border: "1px solid rgba(22,34,46,.14)",
                borderRadius: 12,
                padding: "12px 14px",
                fontSize: 14,
                fontFamily: "inherit",
                lineHeight: 1.5,
                outline: "none",
                resize: "vertical",
                color: C.ink,
                background: C.panelBg,
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button
                onClick={actions.saveNote}
                style={{
                  border: "none",
                  background: C.navy,
                  color: C.cream,
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "9px 18px",
                  borderRadius: 999,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                }}
              >
                Save note
              </button>
              <button
                onClick={actions.closeNote}
                style={{
                  border: "none",
                  background: "none",
                  color: C.muted,
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "9px 12px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* understanding card */}
      <div style={{ ...WHITE_CARD, padding: "30px 34px", marginTop: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600 }}>Understanding this verse</div>
          <Segmented items={LEVELS} active={s.level} onPick={(l) => actions.setLevel(l as never)} padding="6px 12px" />
        </div>

        <Section label="SIMPLE MEANING">
          {lvlBusy ? (
            <SkeletonLines widths={[undefined, "70%"]} />
          ) : (
            <div style={body}>{simpleText}</div>
          )}
        </Section>

        {ex.ctx && (
          <Section label="CONTEXT">
            <div style={body}>{ex.ctx}</div>
          </Section>
        )}

        {ex.words && ex.words.length > 0 && (
          <Section label="KEY WORDS">
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              {ex.words.map((w) => (
                <div key={w.word} style={{ fontSize: 14, lineHeight: 1.55, color: C.bodyInk }}>
                  <span style={{ fontFamily: SERIF, fontWeight: 600, fontStyle: "italic" }}>{w.word}</span>{" "}
                  &mdash; {w.meaning}
                </div>
              ))}
            </div>
          </Section>
        )}

        {people.length > 0 && (
          <Section label="PEOPLE & PLACES">
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              {people.map((p) => (
                <div key={p.name} style={{ fontSize: 14, lineHeight: 1.55, color: C.bodyInk }}>
                  <span style={{ fontWeight: 600 }}>{p.name}</span> &mdash; {p.desc}
                </div>
              ))}
            </div>
          </Section>
        )}

        {ex.lesson && (
          <div style={{ marginTop: 22, background: C.lessonBg, borderRadius: 16, padding: "18px 20px" }}>
            <div style={kicker}>MAIN LESSON</div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 17,
                lineHeight: 1.5,
                marginTop: 6,
                color: C.lessonInk,
                textWrap: "pretty",
              }}
            >
              {ex.lesson}
            </div>
          </div>
        )}

        {ex.apply && (
          <Section label="PRACTICAL APPLICATION">
            <div style={body}>{ex.apply}</div>
          </Section>
        )}

        {ex.reflect && (
          <Section label="REFLECTION">
            <div
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 16,
                lineHeight: 1.6,
                marginTop: 8,
                color: C.bodyInk,
                textWrap: "pretty",
              }}
            >
              {ex.reflect}
            </div>
          </Section>
        )}

        {ex.rel && ex.rel.length > 0 && (
          <Section label="RELATED VERSES">
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              {ex.rel.map((r) => (
                <div
                  key={r.ref}
                  onClick={() => actions.showToast("Cross-reference navigation comes with full Bible data")}
                  style={{ fontSize: 14, lineHeight: 1.55, color: C.bodyInk, cursor: "pointer" }}
                >
                  <span style={{ fontWeight: 600, color: C.navy }}>{r.ref}</span> &mdash; {r.why}
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* ask card */}
      <div style={{ ...WHITE_CARD, padding: "30px 34px", marginTop: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Ask about this verse</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
          {ASK_CHIPS.map((q) => (
            <button
              key={q}
              className="be-outline-gold"
              onClick={() => actions.submitAskQ(q)}
              style={{
                border: "1px solid rgba(22,34,46,.12)",
                background: C.panelBg,
                fontSize: 13,
                padding: "8px 14px",
                borderRadius: 999,
                whiteSpace: "nowrap",
                cursor: "pointer",
                color: C.navy,
              }}
            >
              {q}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <input
            className="be-input"
            value={s.ask}
            onChange={(e) => actions.setAsk(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") actions.submitAsk();
            }}
            placeholder={`Ask a question about John 1:${verseNum}…`}
            style={{
              flex: 1,
              border: "1px solid rgba(22,34,46,.14)",
              background: C.panelBg,
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: 14,
              outline: "none",
              color: C.ink,
            }}
          />
          <button
            className="be-primary"
            onClick={actions.submitAsk}
            style={{
              border: "none",
              background: C.navy,
              color: C.cream,
              fontSize: 14,
              fontWeight: 600,
              padding: "0 22px",
              borderRadius: 12,
              cursor: "pointer",
            }}
          >
            Ask
          </button>
        </div>

        {s.askBusy && <SkeletonLines widths={[undefined, "82%", "60%"]} height={13} />}

        {hasAskAnswer && (
          <div
            style={{
              marginTop: 16,
              background: C.panelBg,
              border: "1px solid rgba(22,34,46,.07)",
              borderRadius: 14,
              padding: "18px 20px",
            }}
          >
            <div
              style={{
                fontSize: 14,
                lineHeight: 1.7,
                color: C.bodyInk,
                whiteSpace: "pre-wrap",
                textWrap: "pretty",
              }}
            >
              {s.askAnswer}
            </div>
          </div>
        )}

        <div style={{ fontSize: 12, color: C.faint, marginTop: 14, lineHeight: 1.5 }}>
          AI commentary explains Scripture in plain language. It is study help, not divine authority
          &mdash; Christians sometimes interpret passages differently.
        </div>
      </div>

      {/* prev / next */}
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <button
          className="be-outline"
          onClick={() => {
            if (vi > 0) actions.goVerse(vi - 1);
          }}
          style={{
            border: "1px solid rgba(22,34,46,.16)",
            background: "#fff",
            color: C.navy,
            fontSize: 15,
            fontWeight: 600,
            padding: "16px 24px",
            borderRadius: 16,
            cursor: "pointer",
            opacity: vi === 0 ? 0.4 : 1,
          }}
        >
          &lsaquo; Previous
        </button>
        <button
          className="be-primary"
          onClick={() => actions.goVerse(vi + 1)}
          style={{
            flex: 1,
            border: "none",
            background: C.navy,
            color: C.cream,
            fontSize: 15,
            fontWeight: 600,
            padding: "16px 24px",
            borderRadius: 16,
            cursor: "pointer",
          }}
        >
          {vi === VERSE_COUNT - 1 ? "Finish chapter ✦" : "Next verse ›"}
        </button>
      </div>
    </div>
  );
}

const navyPill: React.CSSProperties = {
  border: "none",
  background: C.navy,
  color: C.cream,
  fontSize: 13,
  fontWeight: 600,
  padding: "10px 18px",
  borderRadius: 999,
  whiteSpace: "nowrap",
  cursor: "pointer",
};

const outlinePill: React.CSSProperties = {
  border: "1px solid rgba(22,34,46,.16)",
  background: "#fff",
  fontSize: 13,
  fontWeight: 600,
  padding: "10px 16px",
  borderRadius: 999,
  whiteSpace: "nowrap",
  cursor: "pointer",
};
