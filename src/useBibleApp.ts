import { useCallback, useEffect, useRef, useState } from "react";
import { EX, JOHN1, VERSE_COUNT, VOTD } from "./data";
import { AINotConfiguredError, complete, isAIConfigured } from "./ai";

export type Level = "Child" | "Beginner" | "Standard" | "Deep";
export type Screen =
  | "home"
  | "books"
  | "chapters"
  | "reader"
  | "chapter"
  | "done"
  | "library"
  | "listen";

export type Settings = {
  /** Multiplier applied to verse/reading font sizes (0.85–1.35). */
  verseTextScale: number;
  defaultLevel: Level;
  autoAdvanceAudio: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  verseTextScale: 1,
  defaultLevel: "Standard",
  autoAdvanceAudio: true,
};

export type AppState = {
  screen: Screen;
  vi: number;
  level: Level;
  playing: boolean;
  playingVi: number;
  rate: number;
  auto: boolean;
  bookmarks: Record<string, true>;
  notes: Record<string, string>;
  noteOpen: boolean;
  noteDraft: string;
  ask: string;
  askAnswer: string;
  askBusy: boolean;
  lvlCache: Record<string, string>;
  lvlBusy: boolean;
  expanded: Record<number, boolean>;
  quizPicks: number[];
  quizDone: boolean;
  bookSearch: string;
  toast: string;
  isMobile: boolean;
  sleepMin: number;
  votdPlaying: boolean;
};

const STORAGE_KEY = "be_state_v1";
const RATES = [0.8, 1, 1.25, 1.5];
const SLEEP_OPTS = [0, 5, 10, 15];
const MOBILE_BREAKPOINT = 760;

const NOT_CONFIGURED_LVL =
  "Live AI explanations aren’t configured yet. Add an AI endpoint or API key (see the README) to explain this verse at this level. The built-in Standard explanation is always available.";
const NOT_CONFIGURED_ASK =
  "The AI assistant isn’t configured yet. Add an AI endpoint or API key (see the README) to ask questions about any verse.";

export function refFor(vi: number): string {
  return "John 1:" + (vi + 1);
}

/** Which verse the audio player is anchored to (the playing one, else current). */
export function audioViOf(s: Pick<AppState, "playingVi" | "vi">): number {
  return s.playingVi >= 0 ? s.playingVi : s.vi;
}

function sysPrompt(): string {
  return (
    "You are a respectful Bible study assistant. Explain Scripture clearly in " +
    "simple language while preserving the meaning of the passage. Clearly " +
    "separate the Bible text from your explanation. Provide historical, " +
    "cultural, and literary context where useful. Do not claim divine " +
    "authority. When recognised Christian traditions interpret a passage " +
    "differently, briefly note the main views respectfully. Avoid inventing " +
    "facts; when uncertain, say so. Keep answers under 150 words, plain text, " +
    "no markdown."
  );
}

const LEVEL_AUDIENCE: Record<Exclude<Level, "Standard">, string> = {
  Child: "a young child aged 7-10, using warm and very simple words",
  Beginner: "someone completely new to the Bible, avoiding all church jargon",
  Deep: "an advanced student: mention the underlying Greek where relevant, literary structure, and cross-references",
};

function loadInitialState(settings: Settings): AppState {
  let saved: Partial<AppState> = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Partial<AppState>;
  } catch {
    /* ignore */
  }
  return {
    screen: "home",
    vi: saved.vi ?? 0,
    level: saved.level ?? settings.defaultLevel,
    playing: false,
    playingVi: -1,
    rate: saved.rate ?? 1,
    auto: saved.auto !== undefined ? saved.auto : settings.autoAdvanceAudio,
    bookmarks: saved.bookmarks ?? {},
    notes: saved.notes ?? {},
    noteOpen: false,
    noteDraft: "",
    ask: "",
    askAnswer: "",
    askBusy: false,
    lvlCache: {},
    lvlBusy: false,
    expanded: {},
    quizPicks: [-1, -1, -1, -1, -1],
    quizDone: false,
    bookSearch: "",
    toast: "",
    isMobile:
      typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT,
    sleepMin: 0,
    votdPlaying: false,
  };
}

type Patch = Partial<AppState> | ((s: AppState) => Partial<AppState> | null);

export function useBibleApp(settings: Settings = DEFAULT_SETTINGS) {
  const [s, setS] = useState<AppState>(() => loadInitialState(settings));

  // Mirror of the latest state for async / event callbacks that must read live
  // values (audio onend, AI responses) without re-binding.
  const stateRef = useRef(s);
  stateRef.current = s;

  const set = useCallback((patch: Patch) => {
    setS((prev) => {
      const p = typeof patch === "function" ? patch(prev) : patch;
      return p ? { ...prev, ...p } : prev;
    });
  }, []);

  // ---- toast ----
  const toastTimer = useRef<number>();
  const showToast = useCallback(
    (msg: string) => {
      set({ toast: msg });
      clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => set({ toast: "" }), 2400);
    },
    [set],
  );

  // ---- audio (Web Speech) ----
  const stopped = useRef(false);
  const utter = useRef<SpeechSynthesisUtterance>();
  const sleepTimer = useRef<number>();
  const playFromRef = useRef<(i: number, cont: boolean) => void>(() => {});

  const stopAudio = useCallback(() => {
    stopped.current = true;
    window.speechSynthesis?.cancel();
    set((prev) =>
      prev.playing || prev.votdPlaying
        ? { playing: false, playingVi: -1, votdPlaying: false }
        : null,
    );
  }, [set]);

  const speak = useCallback(
    (text: string, onend?: () => void) => {
      const synth = window.speechSynthesis;
      if (!synth) {
        showToast("Audio is not supported in this browser");
        return;
      }
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = stateRef.current.rate;
      u.onend = () => {
        if (stopped.current) return;
        onend?.();
      };
      utter.current = u;
      // Small delay works around a Chrome bug where speak() right after
      // cancel() is dropped.
      window.setTimeout(() => synth.speak(u), 60);
    },
    [showToast],
  );

  const playFrom = useCallback(
    (i: number, cont: boolean) => {
      if (i < 0 || i >= VERSE_COUNT) {
        stopAudio();
        return;
      }
      stopped.current = false;
      set((prev) => {
        const patch: Partial<AppState> = { playing: true, playingVi: i };
        if (prev.screen === "reader" || prev.screen === "listen") patch.vi = i;
        return patch;
      });
      speak("Verse " + (i + 1) + ". " + JOHN1[i], () => {
        const st = stateRef.current;
        if (cont && st.auto && i < VERSE_COUNT - 1) playFromRef.current(i + 1, true);
        else set({ playing: false, playingVi: -1 });
      });
    },
    [set, speak, stopAudio],
  );
  playFromRef.current = playFrom;

  // ---- navigation ----
  const go = useCallback(
    (screen: Screen, extra?: Partial<AppState>) => {
      if (screen !== "listen") stopAudio();
      set({ screen, noteOpen: false, ...(extra || {}) });
      window.scrollTo(0, 0);
    },
    [set, stopAudio],
  );

  const goVerse = useCallback(
    (n: number) => {
      if (n >= VERSE_COUNT) {
        stopAudio();
        go("done");
        return;
      }
      const vi = Math.max(0, Math.min(VERSE_COUNT - 1, n));
      stopAudio();
      set({ vi, noteOpen: false, ask: "", askAnswer: "" });
      window.scrollTo(0, 0);
    },
    [set, stopAudio, go],
  );

  const startReading = useCallback(() => {
    goVerse(0);
    go("reader");
  }, [goVerse, go]);

  const openBookNamed = useCallback(
    (name: string) => {
      if (name === "John") go("chapters");
      else showToast("This prototype includes John 1 — full Bible data comes next");
    },
    [go, showToast],
  );

  const openChapter = useCallback(
    (n: number) => {
      if (n === 1) {
        goVerse(0);
        go("reader");
      } else {
        showToast("This prototype includes John 1");
      }
    },
    [goVerse, go, showToast],
  );

  // ---- AI ----
  const fetchLevel = useCallback(
    (level: Level, vi: number) => {
      const key = vi + "|" + level;
      if (stateRef.current.lvlCache[key] || level === "Standard") return;
      const audience = LEVEL_AUDIENCE[level];
      const ex = EX[vi + 1] || { s: "" };
      set({ lvlBusy: true });
      void (async () => {
        try {
          const t = await complete({
            system: sysPrompt(),
            max_tokens: 400,
            messages: [
              {
                role: "user",
                content:
                  `Explain John 1:${vi + 1} (KJV: "${JOHN1[vi]}") for ${audience}. ` +
                  `Base explanation: ${ex.s || ""} Reply with 2-4 sentences of plain text only.`,
              },
            ],
          });
          set((prev) => ({
            lvlCache: { ...prev.lvlCache, [key]: t.trim() },
            lvlBusy: false,
          }));
        } catch (e) {
          const msg =
            e instanceof AINotConfiguredError
              ? NOT_CONFIGURED_LVL
              : "The AI explanation could not be loaded right now. Please try again in a moment.";
          set((prev) => ({ lvlCache: { ...prev.lvlCache, [key]: msg }, lvlBusy: false }));
        }
      })();
    },
    [set],
  );
  const fetchLevelRef = useRef(fetchLevel);
  fetchLevelRef.current = fetchLevel;

  const setLevel = useCallback((l: Level) => set({ level: l }), [set]);

  // Fetch the AI explanation whenever a non-Standard level or verse changes.
  useEffect(() => {
    if (s.level !== "Standard") fetchLevelRef.current(s.level, s.vi);
  }, [s.level, s.vi]);

  const submitAskQ = useCallback(
    (q: string) => {
      if (!q || !q.trim()) return;
      const vi = stateRef.current.vi;
      set({ ask: q, askBusy: true, askAnswer: "" });
      void (async () => {
        try {
          const t = await complete({
            system: sysPrompt(),
            max_tokens: 600,
            messages: [
              {
                role: "user",
                content:
                  `The reader is studying John 1:${vi + 1} (KJV): "${JOHN1[vi]}". ` +
                  `Their question: ${q}`,
              },
            ],
          });
          set({ askAnswer: t.trim(), askBusy: false });
        } catch (e) {
          const msg =
            e instanceof AINotConfiguredError
              ? NOT_CONFIGURED_ASK
              : "The AI assistant could not answer right now. Please try again in a moment.";
          set({ askAnswer: msg, askBusy: false });
        }
      })();
    },
    [set],
  );

  // ---- bookmarks & notes ----
  const toggleBookmark = useCallback(() => {
    const st = stateRef.current;
    const ref = refFor(st.vi);
    const b = { ...st.bookmarks };
    if (b[ref]) {
      delete b[ref];
      showToast("Removed from saved verses");
    } else {
      b[ref] = true;
      showToast("Saved to your library");
    }
    set({ bookmarks: b });
  }, [set, showToast]);

  const removeBookmark = useCallback(
    (ref: string) => {
      const b = { ...stateRef.current.bookmarks };
      delete b[ref];
      set({ bookmarks: b });
    },
    [set],
  );

  const openNote = useCallback(() => {
    const st = stateRef.current;
    set({ noteOpen: true, noteDraft: st.notes[refFor(st.vi)] || "" });
  }, [set]);
  const closeNote = useCallback(() => set({ noteOpen: false }), [set]);
  const setNoteDraft = useCallback((v: string) => set({ noteDraft: v }), [set]);

  const saveNote = useCallback(() => {
    const st = stateRef.current;
    const ref = refFor(st.vi);
    const n = { ...st.notes };
    if (st.noteDraft.trim()) n[ref] = st.noteDraft.trim();
    else delete n[ref];
    set({ notes: n, noteOpen: false });
    showToast("Note saved");
  }, [set, showToast]);

  const removeNote = useCallback(
    (ref: string) => {
      const n = { ...stateRef.current.notes };
      delete n[ref];
      set({ notes: n });
    },
    [set],
  );

  const openRef = useCallback(
    (ref: string) => {
      const n = parseInt(ref.split(":")[1], 10);
      goVerse(n - 1);
      go("reader");
    },
    [goVerse, go],
  );

  // ---- share / verse-of-the-day ----
  const shareVerse = useCallback(() => {
    const st = stateRef.current;
    try {
      void navigator.clipboard?.writeText(
        "“" + JOHN1[st.vi] + "” — " + refFor(st.vi) + " (KJV)",
      );
    } catch {
      /* clipboard unavailable */
    }
    showToast("Copied to clipboard");
  }, [showToast]);

  const saveVotd = useCallback(() => showToast("Saved to your library"), [showToast]);

  const playVotd = useCallback(() => {
    if (stateRef.current.votdPlaying) {
      stopAudio();
      return;
    }
    stopped.current = false;
    set({ votdPlaying: true });
    speak(VOTD.ref + ". " + VOTD.text, () => set({ votdPlaying: false }));
  }, [set, speak, stopAudio]);

  // ---- audio transport ----
  const togglePlay = useCallback(() => {
    const st = stateRef.current;
    if (st.playing) stopAudio();
    else playFrom(st.vi, false);
  }, [stopAudio, playFrom]);

  const chTogglePlay = useCallback(() => {
    const st = stateRef.current;
    if (st.playing) stopAudio();
    else playFrom(audioViOf(st), true);
  }, [stopAudio, playFrom]);

  const chPrev = useCallback(() => {
    const st = stateRef.current;
    const a = audioViOf(st);
    if (a > 0) {
      if (st.playing) playFrom(a - 1, true);
      else set({ vi: Math.max(0, st.vi - 1) });
    }
  }, [playFrom, set]);

  const chNext = useCallback(() => {
    const st = stateRef.current;
    const a = audioViOf(st);
    if (a < VERSE_COUNT - 1) {
      if (st.playing) playFrom(a + 1, true);
      else set({ vi: Math.min(VERSE_COUNT - 1, st.vi + 1) });
    }
  }, [playFrom, set]);

  const cycleRate = useCallback(() => {
    const r = RATES[(RATES.indexOf(stateRef.current.rate) + 1) % RATES.length];
    set({ rate: r });
    showToast("Speed " + r + "×");
  }, [set, showToast]);

  const toggleAuto = useCallback(
    () => set((prev) => ({ auto: !prev.auto })),
    [set],
  );

  const cycleSleep = useCallback(() => {
    const m =
      SLEEP_OPTS[(SLEEP_OPTS.indexOf(stateRef.current.sleepMin) + 1) % SLEEP_OPTS.length];
    clearTimeout(sleepTimer.current);
    if (m) sleepTimer.current = window.setTimeout(() => stopAudio(), m * 60000);
    set({ sleepMin: m });
    showToast(m ? "Sleep timer: " + m + " minutes" : "Sleep timer off");
  }, [set, showToast, stopAudio]);

  // ---- chapter expand / study ----
  const toggleExpanded = useCallback(
    (i: number) =>
      set((prev) => ({ expanded: { ...prev.expanded, [i]: !prev.expanded[i] } })),
    [set],
  );
  const studyVerse = useCallback(
    (i: number) => {
      goVerse(i);
      go("reader");
    },
    [goVerse, go],
  );

  // ---- quiz ----
  const setPick = useCallback(
    (qi: number, oi: number) => {
      if (stateRef.current.quizDone) return;
      const p = stateRef.current.quizPicks.slice();
      p[qi] = oi;
      set({ quizPicks: p });
    },
    [set],
  );
  const submitQuiz = useCallback(() => {
    if (stateRef.current.quizPicks.includes(-1)) {
      showToast("Answer all five questions first");
      return;
    }
    set({ quizDone: true });
  }, [set, showToast]);
  const retryQuiz = useCallback(
    () => set({ quizDone: false, quizPicks: [-1, -1, -1, -1, -1] }),
    [set],
  );

  const readAgain = useCallback(() => {
    goVerse(0);
    go("reader");
  }, [goVerse, go]);
  const nextChapter = useCallback(
    () => showToast("John 2 comes with full Bible data"),
    [showToast],
  );

  // ---- misc inputs ----
  const setBookSearch = useCallback((v: string) => set({ bookSearch: v }), [set]);
  const setAsk = useCallback((v: string) => set({ ask: v }), [set]);
  const submitAsk = useCallback(
    () => submitAskQ(stateRef.current.ask),
    [submitAskQ],
  );

  // ---- persistence ----
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          bookmarks: s.bookmarks,
          notes: s.notes,
          vi: s.vi,
          level: s.level,
          rate: s.rate,
          auto: s.auto,
        }),
      );
    } catch {
      /* storage unavailable */
    }
  }, [s.bookmarks, s.notes, s.vi, s.level, s.rate, s.auto]);

  // ---- responsive ----
  useEffect(() => {
    const onRes = () => {
      const m = window.innerWidth < MOBILE_BREAKPOINT;
      set((prev) => (m !== prev.isMobile ? { isMobile: m } : null));
    };
    window.addEventListener("resize", onRes);
    onRes();
    return () => window.removeEventListener("resize", onRes);
  }, [set]);

  // ---- teardown ----
  useEffect(() => {
    return () => {
      stopped.current = true;
      window.speechSynthesis?.cancel();
      clearTimeout(toastTimer.current);
      clearTimeout(sleepTimer.current);
    };
  }, []);

  return {
    s,
    settings,
    aiConfigured: isAIConfigured(),
    actions: {
      showToast,
      go,
      goVerse,
      startReading,
      openBookNamed,
      openChapter,
      setLevel,
      submitAskQ,
      submitAsk,
      setAsk,
      toggleBookmark,
      removeBookmark,
      openNote,
      closeNote,
      setNoteDraft,
      saveNote,
      removeNote,
      openRef,
      shareVerse,
      saveVotd,
      playVotd,
      togglePlay,
      chTogglePlay,
      chPrev,
      chNext,
      cycleRate,
      toggleAuto,
      cycleSleep,
      toggleExpanded,
      studyVerse,
      setPick,
      submitQuiz,
      retryQuiz,
      readAgain,
      nextChapter,
      setBookSearch,
    },
  };
}

export type BibleApp = ReturnType<typeof useBibleApp>;
export type Actions = BibleApp["actions"];
