import type { BibleApp } from "../useBibleApp";
import { Segmented } from "./Segmented";

const MODES = ["Verse by verse", "Full chapter", "Listening"];

/** The reading-mode switch shared by the Reader and Full-chapter screens. */
export function Modes({ app }: { app: BibleApp }) {
  const { s, actions } = app;
  const current =
    s.screen === "chapter" ? "Full chapter" : s.screen === "listen" ? "Listening" : "Verse by verse";
  const pick = (m: string) => {
    if (m === "Verse by verse") actions.go("reader");
    else if (m === "Full chapter") actions.go("chapter");
    else actions.go("listen");
  };
  return <Segmented items={MODES} active={current} onPick={pick} />;
}
