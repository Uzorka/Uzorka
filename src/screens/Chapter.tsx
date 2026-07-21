import type { BibleApp } from "../useBibleApp";
import { audioViOf, chapterVersesOf, isSeed } from "../useBibleApp";
import { EX } from "../data";
import { bookMeta, refKey } from "../bible";
import { clickable } from "../a11y";
import { AI_ENABLED } from "../features";
import { C, SERIF, SANS, CARD_SHADOW_LG } from "../theme";
import { Modes } from "../components/Modes";
import { SkeletonLines } from "../components/Skeleton";

const kicker: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: ".14em",
  color: C.gold,
};

export function Chapter({ app }: { app: BibleApp }) {
  const { s, actions, settings } = app;
  const verses = chapterVersesOf(s);
  const chapterLen = verses.length;
  const bookName = bookMeta(s.bookId)?.name ?? "";
  const seed = isSeed(s.bookId, s.chapter);
  const chapterFont = Math.round(18 * settings.verseTextScale);
  const audioVi = audioViOf(s);
  const playerBottom = s.isMobile ? 78 : 20;
  const playGlyph = s.playing ? "❚❚" : "▶";

  return (
    <>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 20px 90px" }}>
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
            <span {...clickable(() => actions.go("books"))} style={{ cursor: "pointer", color: C.navy, fontWeight: 600 }}>
              {bookName}
            </span>{" "}
            &rsaquo;{" "}
            <span {...clickable(() => actions.openBook(s.bookId))} style={{ cursor: "pointer", color: C.navy, fontWeight: 600 }}>
              Chapter {s.chapter}
            </span>{" "}
            &rsaquo; Full chapter
          </div>
          <Modes app={app} />
        </div>

        <div
          style={{
            background: "#fff",
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 22,
            padding: "14px 26px",
            marginTop: 16,
            boxShadow: CARD_SHADOW_LG,
          }}
        >
          <div style={{ fontFamily: SERIF, fontSize: 26, padding: "16px 8px 6px" }}>
            {bookName} {s.chapter}{" "}
            <span style={{ fontSize: 14, color: C.faint, fontFamily: SANS }}>KJV</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {verses.map((text, i) => {
              const ex = seed ? EX[i + 1] : undefined;
              // A verse is expandable only when there's study to show.
              const expandable = seed || AI_ENABLED;
              const open = expandable && !!s.expanded[i];
              const bg = s.playingVi === i ? C.johnBadgeBg : open ? C.panelBg : "transparent";
              const aiKey = refKey({ bookId: s.bookId, chapter: s.chapter, verse: i + 1 }) + "|Standard";
              const aiText = s.aiCache[aiKey];
              const aiBusy = !!s.aiBusy[aiKey] && !aiText;
              return (
                <div key={i} style={{ borderRadius: 14, background: bg, transition: "background .25s" }}>
                  <div
                    {...(expandable ? clickable(() => actions.toggleExpanded(i), `Verse ${i + 1}: show study`) : {})}
                    style={{ display: "flex", gap: 14, padding: "12px 8px", cursor: expandable ? "pointer" : "default" }}
                  >
                    <div
                      style={{
                        fontFamily: SERIF,
                        fontSize: 13,
                        color: C.goldBar,
                        minWidth: 22,
                        textAlign: "right",
                        paddingTop: 5,
                      }}
                    >
                      {i + 1}
                    </div>
                    <div
                      style={{
                        fontFamily: SERIF,
                        fontSize: chapterFont,
                        lineHeight: 1.6,
                        flex: 1,
                        textWrap: "pretty",
                      }}
                    >
                      {text}
                    </div>
                  </div>
                  {open && (
                    <div
                      style={{
                        margin: "0 8px 12px 44px",
                        background: C.panelBg,
                        border: "1px solid rgba(22,34,46,.07)",
                        borderRadius: 14,
                        padding: "16px 18px",
                      }}
                    >
                      <div style={kicker}>SIMPLE MEANING</div>
                      {seed ? (
                        <>
                          <div style={{ fontSize: 14, lineHeight: 1.6, marginTop: 6, color: C.bodyInk, textWrap: "pretty" }}>
                            {ex?.s ?? ""}
                          </div>
                          <div style={{ ...kicker, marginTop: 12 }}>MAIN LESSON</div>
                          <div style={{ fontSize: 14, lineHeight: 1.6, marginTop: 6, color: C.bodyInk, textWrap: "pretty" }}>
                            {ex?.lesson ?? ""}
                          </div>
                        </>
                      ) : aiBusy ? (
                        <SkeletonLines widths={[undefined, "72%"]} height={13} />
                      ) : (
                        <div style={{ fontSize: 14, lineHeight: 1.6, marginTop: 6, color: C.bodyInk, textWrap: "pretty" }}>
                          {aiText ?? ""}
                        </div>
                      )}
                      <button
                        onClick={() => actions.studyVerse(i)}
                        style={{
                          marginTop: 12,
                          border: "none",
                          background: C.navy,
                          color: C.cream,
                          fontSize: 12,
                          fontWeight: 600,
                          padding: "8px 15px",
                          borderRadius: 999,
                          whiteSpace: "nowrap",
                          cursor: "pointer",
                        }}
                      >
                        Full study &rsaquo;
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* fixed audio player */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: playerBottom,
          zIndex: 60,
          display: "flex",
          justifyContent: "center",
          padding: "0 16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(22,40,58,.94)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            color: C.cream,
            borderRadius: 999,
            padding: "10px 14px",
            boxShadow: "0 12px 32px rgba(22,34,46,.3)",
          }}
        >
          <button onClick={actions.chPrev} style={ghostCtl} aria-label="Previous verse">
            &#9198;
          </button>
          <button
            onClick={actions.chTogglePlay}
            aria-label={s.playing ? "Pause" : "Play"}
            style={{
              border: "none",
              background: C.cream,
              color: C.navy,
              width: 42,
              height: 42,
              borderRadius: "50%",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {playGlyph}
          </button>
          <button onClick={actions.chNext} style={ghostCtl} aria-label="Next verse">
            &#9197;
          </button>
          <div style={{ fontSize: 12, fontWeight: 600, padding: "0 6px", whiteSpace: "nowrap" }}>
            Verse {audioVi + 1} of {chapterLen}
          </div>
          <button onClick={actions.cycleRate} style={outlineCtl}>
            {s.rate}×
          </button>
          <button
            onClick={actions.toggleAuto}
            style={{ ...outlineCtl, background: s.auto ? "rgba(217,191,127,.25)" : "none" }}
          >
            Auto {s.auto ? "on" : "off"}
          </button>
        </div>
      </div>
    </>
  );
}

const ghostCtl: React.CSSProperties = {
  border: "none",
  background: "none",
  color: C.cream,
  fontSize: 16,
  cursor: "pointer",
  padding: "6px 8px",
};

const outlineCtl: React.CSSProperties = {
  border: "1px solid rgba(246,244,239,.3)",
  background: "none",
  color: C.cream,
  fontSize: 12,
  fontWeight: 600,
  padding: "6px 12px",
  borderRadius: 999,
  whiteSpace: "nowrap",
  cursor: "pointer",
};
