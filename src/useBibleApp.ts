import { useCallback, useEffect, useRef, useState } from "react";
import { EX, VOTD } from "./data";
import {
  BIBLE_BOOKS,
  bookMeta,
  BOOK_IDS,
  cachedBook,
  displayRef,
  loadBook,
  refKey,
  type LoadedBook,
  type Ref,
} from "./bible";
import { AINotConfiguredError, complete, isAIConfigured } from "./ai";
import { AI_ENABLED } from "./features";

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
  /** Reading position. */
  bookId: string;
  chapter: number; // 1-based
  vi: number; // verse index within chapter (0-based)
  /** Book currently being browsed in the Books → Chapters flow. */
  browseBookId: string;
  /** Loaded text for the reading-position book (null until fetched). */
  book: LoadedBook | null;
  bookLoading: boolean;
  loadError: string;
  level: Level;
  playing: boolean;
  playingVi: number;
  rate: number;
  auto: boolean;
  bookmarks: Record<string, true>; // keyed by refKey "bookId/ch/verse"
  notes: Record<string, string>;
  noteOpen: boolean;
  noteDraft: string;
  ask: string;
  askAnswer: string;
  askBusy: boolean;
  aiCache: Record<string, string>; // key: "bookId/ch/verse|level"
  aiBusy: Record<string, true>; // in-flight AI keys
  expanded: Record<number, boolean>; // chapter-reader expanded verse indexes
  quizPicks: number[];
  quizDone: boolean;
  bookSearch: string;
  toast: string;
  isMobile: boolean;
  sleepMin: number;
  votdPlaying: boolean;
};

const STORAGE_KEY = "be_state_v2";
const RATES = [0.8, 1, 1.25, 1.5];
const SLEEP_OPTS = [0, 5, 10, 15];
const MOBILE_BREAKPOINT = 760;

const NOT_CONFIGURED_LVL =
  "Live AI explanations aren’t configured yet. Add an AI endpoint or API key (see the README) to explain this verse. Bible text is always available.";
const NOT_CONFIGURED_ASK =
  "The AI assistant isn’t configured yet. Add an AI endpoint or API key (see the README) to ask questions about any verse.";

/** Only the Gospel of John chapter 1 ships hand-written study content. */
export function isSeed(bookId: string, chapter: number): boolean {
  return bookId === "john" && chapter === 1;
}

export function curRef(s: Pick<AppState, "bookId" | "chapter" | "vi">): Ref {
  return { bookId: s.bookId, chapter: s.chapter, verse: s.vi + 1 };
}

function chapterVerses(s: AppState): string[] {
  const b = s.book;
  if (b && b.id === s.bookId) return b.chapters[s.chapter - 1] ?? [];
  const c = cachedBook(s.bookId);
  return c ? c.chapters[s.chapter - 1] ?? [] : [];
}

export function refFor(s: Pick<AppState, "bookId" | "chapter" | "vi">): string {
  return displayRef(curRef(s));
}

/** Verses of the current chapter, from loaded or cached book data. */
export function chapterVersesOf(s: AppState): string[] {
  return chapterVerses(s);
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

const LEVEL_AUDIENCE: Record<Level, string> = {
  Child: "a young child aged 7-10, using warm and very simple words",
  Beginner: "someone completely new to the Bible, avoiding all church jargon",
  Standard: "a general adult reader, in clear and plain English",
  Deep: "an advanced student: mention the underlying Greek or Hebrew where relevant, literary structure, and cross-references",
};

function omit<T extends Record<string, unknown>>(obj: T, key: string): T {
  const { [key]: _drop, ...rest } = obj;
  return rest as T;
}

function loadInitialState(settings: Settings): AppState {
  let saved: Partial<AppState> = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Partial<AppState>;
  } catch {
    /* ignore */
  }
  const bookId = saved.bookId && bookMeta(saved.bookId) ? saved.bookId : "john";
  return {
    screen: "home",
    bookId,
    chapter: saved.chapter && saved.chapter > 0 ? saved.chapter : 1,
    vi: saved.vi ?? 0,
    browseBookId: bookId,
    book: null,
    bookLoading: false,
    loadError: "",
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
    aiCache: {},
    aiBusy: {},
    expanded: {},
    quizPicks: [-1, -1, -1, -1, -1],
    quizDone: false,
    bookSearch: "",
    toast: "",
    isMobile: typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT,
    sleepMin: 0,
    votdPlaying: false,
  };
}

/** A location parsed from / bound for the URL. */
export type RouteNav = {
  screen: Screen;
  bookId?: string;
  chapter?: number;
  verse?: number;
};

type Patch = Partial<AppState> | ((s: AppState) => Partial<AppState> | null);

export function useBibleApp(settings: Settings = DEFAULT_SETTINGS) {
  const [s, setS] = useState<AppState>(() => loadInitialState(settings));

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
      window.setTimeout(() => synth.speak(u), 60);
    },
    [showToast],
  );

  const playFrom = useCallback(
    (i: number, cont: boolean) => {
      const verses = chapterVerses(stateRef.current);
      if (i < 0 || i >= verses.length) {
        stopAudio();
        return;
      }
      stopped.current = false;
      set((prev) => {
        const patch: Partial<AppState> = { playing: true, playingVi: i };
        if (prev.screen === "reader" || prev.screen === "listen") patch.vi = i;
        return patch;
      });
      speak("Verse " + (i + 1) + ". " + verses[i], () => {
        const st = stateRef.current;
        if (cont && st.auto && i < verses.length - 1) playFromRef.current(i + 1, true);
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

  /** Load (if needed) a book and set the reading position, then show `screen`. */
  const openReading = useCallback(
    (bookId: string, chapter: number, viTarget: number, screen: Screen) => {
      const meta = bookMeta(bookId);
      if (!meta) return;
      stopAudio();
      const ch = Math.min(Math.max(1, chapter), meta.chapters);
      const cached = cachedBook(bookId);
      const clampVi = (b: LoadedBook) => {
        const len = b.chapters[ch - 1]?.length ?? 0;
        return Math.min(Math.max(0, viTarget), Math.max(0, len - 1));
      };
      if (cached) {
        set({
          book: cached,
          bookId,
          browseBookId: bookId,
          chapter: ch,
          vi: clampVi(cached),
          bookLoading: false,
          loadError: "",
          noteOpen: false,
          ask: "",
          askAnswer: "",
          expanded: {},
          screen,
        });
        window.scrollTo(0, 0);
        return;
      }
      set({
        bookId,
        browseBookId: bookId,
        chapter: ch,
        vi: Math.max(0, viTarget),
        bookLoading: true,
        loadError: "",
        noteOpen: false,
        ask: "",
        askAnswer: "",
        expanded: {},
        screen,
      });
      window.scrollTo(0, 0);
      loadBook(bookId)
        .then((b) =>
          set((prev) =>
            prev.bookId === bookId && prev.chapter === ch
              ? { book: b, vi: clampVi(b), bookLoading: false }
              : null,
          ),
        )
        .catch((e) =>
          set((prev) =>
            prev.bookId === bookId
              ? { bookLoading: false, loadError: e instanceof Error ? e.message : String(e) }
              : null,
          ),
        );
    },
    [set, stopAudio],
  );

  const openBook = useCallback(
    (bookId: string) => {
      set({ browseBookId: bookId });
      go("chapters");
      loadBook(bookId).catch(() => {});
    },
    [set, go],
  );

  const openChapter = useCallback(
    (chapter: number) => openReading(stateRef.current.browseBookId, chapter, 0, "reader"),
    [openReading],
  );

  const goVerse = useCallback(
    (n: number) => {
      const st = stateRef.current;
      const len = chapterVerses(st).length;
      if (n >= len) {
        stopAudio();
        go("done");
        return;
      }
      const vi = Math.max(0, Math.min(Math.max(0, len - 1), n));
      stopAudio();
      set({ vi, noteOpen: false, ask: "", askAnswer: "" });
      window.scrollTo(0, 0);
    },
    [set, stopAudio, go],
  );

  const startReading = useCallback(() => {
    const st = stateRef.current;
    openReading(st.bookId, st.chapter, st.vi, "reader");
  }, [openReading]);

  const goContinue = useCallback(() => {
    const st = stateRef.current;
    openReading(st.bookId, st.chapter, st.vi, "reader");
  }, [openReading]);

  /** Next/previous chapter, rolling over into adjacent books. */
  const stepChapter = useCallback(
    (dir: 1 | -1) => {
      const st = stateRef.current;
      const meta = bookMeta(st.bookId);
      if (!meta) return;
      let bookId = st.bookId;
      let chapter = st.chapter + dir;
      if (chapter < 1 || chapter > meta.chapters) {
        const bi = BOOK_IDS.indexOf(st.bookId) + dir;
        if (bi < 0 || bi >= BOOK_IDS.length) return;
        bookId = BOOK_IDS[bi];
        chapter = dir === 1 ? 1 : (bookMeta(bookId)?.chapters ?? 1);
      }
      openReading(bookId, chapter, 0, "reader");
    },
    [openReading],
  );

  // ---- AI ----
  const fetchAIFor = useCallback(
    (ref: Ref, level: Level) => {
      const key = refKey(ref) + "|" + level;
      const st = stateRef.current;
      if (st.aiCache[key] || st.aiBusy[key]) return;
      if (isSeed(ref.bookId, ref.chapter) && level === "Standard") return;
      const b = cachedBook(ref.bookId);
      const text = b?.chapters[ref.chapter - 1]?.[ref.verse - 1];
      if (!text) return;
      const base = isSeed(ref.bookId, ref.chapter) ? EX[ref.verse]?.s ?? "" : "";
      set((prev) => ({ aiBusy: { ...prev.aiBusy, [key]: true } }));
      void (async () => {
        try {
          const t = await complete({
            system: sysPrompt(),
            max_tokens: 400,
            messages: [
              {
                role: "user",
                content:
                  `Explain ${displayRef(ref)} (KJV: "${text}") for ${LEVEL_AUDIENCE[level]}. ` +
                  (base ? `Base explanation: ${base} ` : "") +
                  "Reply with 2-4 sentences of plain text only.",
              },
            ],
          });
          set((prev) => ({
            aiCache: { ...prev.aiCache, [key]: t.trim() },
            aiBusy: omit(prev.aiBusy, key),
          }));
        } catch (e) {
          const msg =
            e instanceof AINotConfiguredError
              ? NOT_CONFIGURED_LVL
              : "Couldn’t load the explanation — " +
                (e instanceof Error && e.message ? e.message : "please try again in a moment.");
          set((prev) => ({ aiCache: { ...prev.aiCache, [key]: msg }, aiBusy: omit(prev.aiBusy, key) }));
        }
      })();
    },
    [set],
  );
  const fetchRef = useRef(fetchAIFor);
  fetchRef.current = fetchAIFor;

  const setLevel = useCallback((l: Level) => set({ level: l }), [set]);

  // Fetch the reader's AI explanation when it's needed and missing.
  useEffect(() => {
    if (s.screen !== "reader") return;
    if (!s.book || s.book.id !== s.bookId) return;
    if (isSeed(s.bookId, s.chapter) && s.level === "Standard") return;
    fetchRef.current(curRef(s), s.level);
  }, [s.screen, s.book, s.bookId, s.chapter, s.vi, s.level]);

  const submitAskQ = useCallback(
    (q: string) => {
      if (!q || !q.trim()) return;
      const st = stateRef.current;
      const ref = curRef(st);
      const text = chapterVerses(st)[st.vi] || "";
      set({ ask: q, askBusy: true, askAnswer: "" });
      void (async () => {
        try {
          const t = await complete({
            system: sysPrompt(),
            max_tokens: 600,
            messages: [
              {
                role: "user",
                content: `The reader is studying ${displayRef(ref)} (KJV): "${text}". Their question: ${q}`,
              },
            ],
          });
          set({ askAnswer: t.trim(), askBusy: false });
        } catch (e) {
          const msg =
            e instanceof AINotConfiguredError
              ? NOT_CONFIGURED_ASK
              : "The assistant couldn’t answer — " +
                (e instanceof Error && e.message ? e.message : "please try again in a moment.");
          set({ askAnswer: msg, askBusy: false });
        }
      })();
    },
    [set],
  );

  // ---- bookmarks & notes ----
  const toggleBookmark = useCallback(() => {
    const st = stateRef.current;
    const key = refKey(curRef(st));
    const b = { ...st.bookmarks };
    if (b[key]) {
      delete b[key];
      showToast("Removed from saved verses");
    } else {
      b[key] = true;
      showToast("Saved to your library");
    }
    set({ bookmarks: b });
  }, [set, showToast]);

  const removeBookmark = useCallback(
    (key: string) => {
      const b = { ...stateRef.current.bookmarks };
      delete b[key];
      set({ bookmarks: b });
    },
    [set],
  );

  const openNote = useCallback(() => {
    const st = stateRef.current;
    set({ noteOpen: true, noteDraft: st.notes[refKey(curRef(st))] || "" });
  }, [set]);
  const closeNote = useCallback(() => set({ noteOpen: false }), [set]);
  const setNoteDraft = useCallback((v: string) => set({ noteDraft: v }), [set]);

  const saveNote = useCallback(() => {
    const st = stateRef.current;
    const key = refKey(curRef(st));
    const n = { ...st.notes };
    if (st.noteDraft.trim()) n[key] = st.noteDraft.trim();
    else delete n[key];
    set({ notes: n, noteOpen: false });
    showToast("Note saved");
  }, [set, showToast]);

  const removeNote = useCallback(
    (key: string) => {
      const n = { ...stateRef.current.notes };
      delete n[key];
      set({ notes: n });
    },
    [set],
  );

  /** Open a stored ref key ("bookId/ch/verse") in the reader. */
  const openRefKey = useCallback(
    (key: string) => {
      const [bookId, c, v] = key.split("/");
      openReading(bookId, parseInt(c, 10), parseInt(v, 10) - 1, "reader");
    },
    [openReading],
  );

  // ---- share / verse-of-the-day ----
  const shareVerse = useCallback(() => {
    const st = stateRef.current;
    const text = chapterVerses(st)[st.vi] || "";
    try {
      void navigator.clipboard?.writeText(`“${text}” — ${refFor(st)} (KJV)`);
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
    const len = chapterVerses(st).length;
    if (a < len - 1) {
      if (st.playing) playFrom(a + 1, true);
      else set({ vi: Math.min(len - 1, st.vi + 1) });
    }
  }, [playFrom, set]);

  const cycleRate = useCallback(() => {
    const r = RATES[(RATES.indexOf(stateRef.current.rate) + 1) % RATES.length];
    set({ rate: r });
    showToast("Speed " + r + "×");
  }, [set, showToast]);

  const toggleAuto = useCallback(() => set((prev) => ({ auto: !prev.auto })), [set]);

  const cycleSleep = useCallback(() => {
    const m = SLEEP_OPTS[(SLEEP_OPTS.indexOf(stateRef.current.sleepMin) + 1) % SLEEP_OPTS.length];
    clearTimeout(sleepTimer.current);
    if (m) sleepTimer.current = window.setTimeout(() => stopAudio(), m * 60000);
    set({ sleepMin: m });
    showToast(m ? "Sleep timer: " + m + " minutes" : "Sleep timer off");
  }, [set, showToast, stopAudio]);

  // ---- chapter expand / study ----
  const toggleExpanded = useCallback(
    (i: number) => {
      set((prev) => ({ expanded: { ...prev.expanded, [i]: !prev.expanded[i] } }));
      // For non-seed chapters, fetch the plain-language meaning on demand (only
      // when the AI features are enabled).
      const st = stateRef.current;
      if (AI_ENABLED && !isSeed(st.bookId, st.chapter) && !st.expanded[i]) {
        fetchRef.current({ bookId: st.bookId, chapter: st.chapter, verse: i + 1 }, "Standard");
      }
    },
    [set],
  );
  const studyVerse = useCallback(
    (i: number) => {
      const st = stateRef.current;
      openReading(st.bookId, st.chapter, i, "reader");
    },
    [openReading],
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
    const st = stateRef.current;
    openReading(st.bookId, st.chapter, 0, "reader");
  }, [openReading]);
  const nextChapter = useCallback(() => stepChapter(1), [stepChapter]);

  // ---- misc inputs ----
  const setBookSearch = useCallback((v: string) => set({ bookSearch: v }), [set]);
  const setAsk = useCallback((v: string) => set({ ask: v }), [set]);
  const submitAsk = useCallback(() => submitAskQ(stateRef.current.ask), [submitAskQ]);

  /** Apply a location parsed from the URL (used by the router). */
  const applyRoute = useCallback(
    (nav: RouteNav) => {
      const st = stateRef.current;
      switch (nav.screen) {
        case "home":
        case "books":
        case "library":
          if (st.screen !== nav.screen) go(nav.screen);
          break;
        case "chapters":
          if (nav.bookId && bookMeta(nav.bookId)) {
            set({ browseBookId: nav.bookId });
            go("chapters");
            loadBook(nav.bookId).catch(() => {});
          }
          break;
        case "reader":
        case "chapter":
        case "listen": {
          const bookId = nav.bookId && bookMeta(nav.bookId) ? nav.bookId : st.bookId;
          const chapter = nav.chapter ?? st.chapter;
          const vi = (nav.verse ?? 1) - 1;
          openReading(bookId, chapter, vi, nav.screen);
          break;
        }
        case "done":
          if (nav.bookId && bookMeta(nav.bookId)) openReading(nav.bookId, nav.chapter ?? 1, 0, "done");
          break;
      }
    },
    [set, go, openReading],
  );

  // ---- initial book preload ----
  useEffect(() => {
    const id = stateRef.current.bookId;
    if (!cachedBook(id)) {
      loadBook(id)
        .then((b) => set((prev) => (prev.bookId === id ? { book: b } : null)))
        .catch(() => {});
    } else {
      set({ book: cachedBook(id) ?? null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- persistence ----
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          bookmarks: s.bookmarks,
          notes: s.notes,
          bookId: s.bookId,
          chapter: s.chapter,
          vi: s.vi,
          level: s.level,
          rate: s.rate,
          auto: s.auto,
        }),
      );
    } catch {
      /* storage unavailable */
    }
  }, [s.bookmarks, s.notes, s.bookId, s.chapter, s.vi, s.level, s.rate, s.auto]);

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
    books: BIBLE_BOOKS,
    actions: {
      showToast,
      go,
      openBook,
      openChapter,
      openReading,
      goVerse,
      startReading,
      goContinue,
      stepChapter,
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
      openRefKey,
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
      applyRoute,
    },
  };
}

export type BibleApp = ReturnType<typeof useBibleApp>;
export type Actions = BibleApp["actions"];
