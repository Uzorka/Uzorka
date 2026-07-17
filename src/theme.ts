// Design tokens lifted verbatim from the handoff prototype so the React build
// stays pixel-identical to the mock. Colors, fonts, and shadows all live here.

export const C = {
  bg: "#f6f4ef",
  ink: "#16222e",
  navy: "#16324f",
  navyHover: "#1d3f63",
  gold: "#8a6d2f",
  goldBar: "#b08c46",
  cream: "#f6f4ef",
  muted: "#5c6672",
  faint: "#8a929c",
  bodyInk: "#2c3844",
  cardBorder: "rgba(22,34,46,.08)",
  chipCream: "#efe9db",
  chipInk: "#6d5626",
  lessonBg: "#f6efdd",
  lessonInk: "#4a3c1c",
  panelBg: "#fbfaf7",
  johnBadgeBg: "#f3edde",
  night: "#101d2b",
  nightInk: "#f2ede1",
  nightGold: "#d9bf7f",
} as const;

export const SERIF = "'Iowan Old Style',Palatino,Georgia,serif";
export const SANS =
  "-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Helvetica,Arial,sans-serif";

/** The soft double shadow used on every white card in the design. */
export const CARD_SHADOW =
  "0 1px 2px rgba(22,34,46,.04),0 8px 24px rgba(22,34,46,.05)";
/** The slightly deeper shadow used on reader/study cards. */
export const CARD_SHADOW_LG =
  "0 1px 2px rgba(22,34,46,.04),0 10px 30px rgba(22,34,46,.06)";

export const KICKER: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: ".14em",
  color: C.gold,
};

export const WHITE_CARD: React.CSSProperties = {
  background: "#fff",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 22,
  boxShadow: CARD_SHADOW_LG,
};
