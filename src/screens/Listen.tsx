import type { BibleApp } from "../useBibleApp";
import { audioViOf, chapterVersesOf } from "../useBibleApp";
import { bookMeta } from "../bible";
import { C, SERIF } from "../theme";

const roundCtl: React.CSSProperties = {
  border: "1px solid rgba(242,237,225,.25)",
  background: "none",
  color: C.nightInk,
  width: 52,
  height: 52,
  borderRadius: "50%",
  fontSize: 18,
  cursor: "pointer",
};

const chip: React.CSSProperties = {
  border: "1px solid rgba(242,237,225,.25)",
  background: "none",
  color: C.nightInk,
  fontSize: 13,
  fontWeight: 600,
  padding: "9px 18px",
  borderRadius: 999,
  whiteSpace: "nowrap",
  cursor: "pointer",
};

export function Listen({ app }: { app: BibleApp }) {
  const { s, actions, settings } = app;
  const verses = chapterVersesOf(s);
  const chapterLen = verses.length;
  const audioVi = audioViOf(s);
  const bookName = bookMeta(s.bookId)?.name ?? "";
  const listenFont = Math.round(34 * settings.verseTextScale);
  const listenPct = chapterLen ? Math.round(((audioVi + 1) / chapterLen) * 100) + "%" : "0%";
  const playGlyph = s.playing ? "❚❚" : "▶";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: C.night,
        color: C.nightInk,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
      }}
    >
      <button
        className="be-listen-ctl"
        onClick={() => actions.go("reader")}
        style={{
          position: "absolute",
          top: 20,
          right: 24,
          border: "1px solid rgba(242,237,225,.25)",
          background: "none",
          color: C.nightInk,
          fontSize: 13,
          fontWeight: 600,
          padding: "9px 18px",
          borderRadius: 999,
          whiteSpace: "nowrap",
          cursor: "pointer",
        }}
      >
        Close
      </button>

      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".18em", color: C.nightGold }}>
        LISTENING · {bookName.toUpperCase()} {s.chapter} : {audioVi + 1}
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontSize: listenFont,
          lineHeight: 1.5,
          textAlign: "center",
          maxWidth: 720,
          marginTop: 26,
          textWrap: "pretty",
        }}
      >
        &ldquo;{verses[audioVi] ?? ""}&rdquo;
      </div>

      <div style={{ width: "100%", maxWidth: 420, marginTop: 40 }}>
        <div style={{ height: 4, borderRadius: 2, background: "rgba(242,237,225,.15)", overflow: "hidden" }}>
          <div style={{ height: 4, borderRadius: 2, background: C.nightGold, width: listenPct, transition: "width .4s" }} />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            color: "rgba(242,237,225,.6)",
            marginTop: 8,
          }}
        >
          <span>Verse {audioVi + 1}</span>
          <span>of {chapterLen}</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 30 }}>
        <button className="be-listen-ctl" onClick={actions.chPrev} style={roundCtl} aria-label="Previous verse">
          &#9198;
        </button>
        <button
          onClick={actions.chTogglePlay}
          aria-label={s.playing ? "Pause" : "Play"}
          style={{
            border: "none",
            background: C.nightInk,
            color: C.night,
            width: 78,
            height: 78,
            borderRadius: "50%",
            fontSize: 24,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 10px 30px rgba(0,0,0,.35)",
          }}
        >
          {playGlyph}
        </button>
        <button className="be-listen-ctl" onClick={actions.chNext} style={roundCtl} aria-label="Next verse">
          &#9197;
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 26, flexWrap: "wrap", justifyContent: "center" }}>
        <button className="be-listen-ctl" onClick={actions.cycleRate} style={chip}>
          Speed {s.rate}×
        </button>
        <button
          className="be-listen-ctl"
          onClick={actions.toggleAuto}
          style={{ ...chip, background: s.auto ? "rgba(217,191,127,.2)" : "none" }}
        >
          Auto-continue {s.auto ? "on" : "off"}
        </button>
        <button className="be-listen-ctl" onClick={actions.cycleSleep} style={chip}>
          Sleep {s.sleepMin ? s.sleepMin + " min" : "off"}
        </button>
      </div>
    </div>
  );
}
