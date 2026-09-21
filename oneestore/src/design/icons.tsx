/**
 * ONEESTORE icon set — drawn here, from scratch.
 *
 * One geometry for the whole set: 24×24 box, 1.7px stroke, round caps and
 * joins, no fills. That consistency is why they read as a family. Every icon
 * inherits `currentColor` and is `aria-hidden` by default, because an icon
 * beside a label must never be announced twice.
 */

type P = { size?: number; className?: string; strokeWidth?: number };

function Svg({
  size = 22,
  className,
  strokeWidth = 1.7,
  children,
}: P & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ flex: "0 0 auto" }}
    >
      {children}
    </svg>
  );
}

/* --- Navigation ----------------------------------------------------------- */

export const IconHome = (p: P) => (
  <Svg {...p}>
    <path d="M4 10.6 12 4l8 6.6" />
    <path d="M6 9.6V19a1 1 0 0 0 1 1h3.4v-4.6h3.2V20H17a1 1 0 0 0 1-1V9.6" />
  </Svg>
);

/* A fish, three strokes: body, tail, eye. ONEESTORE's shop mark. */
export const IconFish = (p: P) => (
  <Svg {...p}>
    <path d="M3.4 12c2.5-3.7 5.6-5.6 9.3-5.6 3.2 0 5.7 1.6 7.4 4.1.3.5.3 1.1 0 1.6-1.7 2.5-4.2 4.1-7.4 4.1-3.7 0-6.8-1.9-9.3-5.6Z" />
    <path d="m20.3 9.3 .2-2.9-3.1 1.9M20.3 14.7l.2 2.9-3.1-1.9" />
    <circle cx="8.4" cy="11.1" r=".9" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconSearch = (p: P) => (
  <Svg {...p}>
    <circle cx="10.8" cy="10.8" r="6.2" />
    <path d="m15.4 15.4 4 4" />
  </Svg>
);

/* Basket, not a trolley — ONEESTORE calls it a basket everywhere. */
export const IconBasket = (p: P) => (
  <Svg {...p}>
    <path d="M3.6 8.8h16.8l-1.5 9.1a2 2 0 0 1-2 1.7H7.1a2 2 0 0 1-2-1.7L3.6 8.8Z" />
    <path d="M8.4 8.8 10.7 4M15.6 8.8 13.3 4" />
    <path d="M9.6 12.4v3.6M14.4 12.4v3.6" />
  </Svg>
);

export const IconReceipt = (p: P) => (
  <Svg {...p}>
    <path d="M6 3.4h12v15.9a1.3 1.3 0 0 1-2 1l-1.4-1-1.5 1.1a1.2 1.2 0 0 1-1.4 0l-1.5-1.1-1.4 1a1.3 1.3 0 0 1-2-1V3.4Z" />
    <path d="M9.2 8h5.6M9.2 11.6h5.6M9.2 15.2h3.2" />
  </Svg>
);

export const IconUser = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="8.4" r="3.6" />
    <path d="M5.2 19.6c.6-3.3 3.4-5.3 6.8-5.3s6.2 2 6.8 5.3" />
  </Svg>
);

/* --- Controls ------------------------------------------------------------- */

export const IconChevronRight = (p: P) => (
  <Svg {...p}>
    <path d="m9.6 5.6 6.4 6.4-6.4 6.4" />
  </Svg>
);
export const IconChevronLeft = (p: P) => (
  <Svg {...p}>
    <path d="m14.4 5.6-6.4 6.4 6.4 6.4" />
  </Svg>
);
export const IconChevronDown = (p: P) => (
  <Svg {...p}>
    <path d="m5.6 9.6 6.4 6.4 6.4-6.4" />
  </Svg>
);
export const IconClose = (p: P) => (
  <Svg {...p}>
    <path d="m6.4 6.4 11.2 11.2M17.6 6.4 6.4 17.6" />
  </Svg>
);
export const IconPlus = (p: P) => (
  <Svg {...p}>
    <path d="M12 5.2v13.6M5.2 12h13.6" />
  </Svg>
);
export const IconMinus = (p: P) => (
  <Svg {...p}>
    <path d="M5.2 12h13.6" />
  </Svg>
);
export const IconCheck = (p: P) => (
  <Svg {...p}>
    <path d="m5 12.8 4.6 4.4L19 6.8" />
  </Svg>
);
export const IconHeart = ({ filled, ...p }: P & { filled?: boolean }) => (
  <Svg {...p}>
    <path
      d="M12 20.1C7.6 17.3 4 14.3 4 10.5A4.1 4.1 0 0 1 8.1 6.4c1.7 0 2.9.8 3.9 2.2 1-1.4 2.2-2.2 3.9-2.2A4.1 4.1 0 0 1 20 10.5c0 3.8-3.6 6.8-8 9.6Z"
      fill={filled ? "currentColor" : "none"}
    />
  </Svg>
);
export const IconFilter = (p: P) => (
  <Svg {...p}>
    <path d="M4.4 7h15.2M7.2 12h9.6M10 17h4" />
  </Svg>
);
export const IconSort = (p: P) => (
  <Svg {...p}>
    <path d="M7 4.8v14.4M3.8 16l3.2 3.2L10.2 16" />
    <path d="M17 19.2V4.8M13.8 8 17 4.8 20.2 8" />
  </Svg>
);
export const IconGrid = (p: P) => (
  <Svg {...p}>
    <rect x="4" y="4" width="7" height="7" rx="1.8" />
    <rect x="13" y="4" width="7" height="7" rx="1.8" />
    <rect x="4" y="13" width="7" height="7" rx="1.8" />
    <rect x="13" y="13" width="7" height="7" rx="1.8" />
  </Svg>
);
export const IconSpark = (p: P) => (
  <Svg {...p}>
    <path d="M12 3.6l1.7 4.6 4.7 1.8-4.7 1.8L12 16.4l-1.7-4.6L5.6 10l4.7-1.8L12 3.6Z" />
    <path d="M18.4 16.6l.7 1.8 1.9.7-1.9.7-.7 1.8-.7-1.8-1.9-.7 1.9-.7.7-1.8Z" />
  </Svg>
);

/* --- Domain: the things ONEESTORE actually sells and does ------------------ */

/* Prawn: curled body with legs — reads at 20px. */
export const IconPrawn = (p: P) => (
  <Svg {...p}>
    <path d="M19.4 6.6c-5 0-8.2 2-9.8 4.6-1.3 2.2-1 4.6.8 5.8 1.7 1.1 4 .6 5.2-1 .8-1.1.8-2.3.1-3" />
    <path d="M19.4 6.6c-2.6.3-4.6 1.3-6 2.7M6.2 13.4 4 12.2M6.6 15.8l-2.4.5M8 17.8l-1.6 1.8" />
  </Svg>
);

/* Crab: shell, claws, legs. */
export const IconCrab = (p: P) => (
  <Svg {...p}>
    <path d="M6.6 13.6a5.4 5.4 0 0 1 10.8 0" />
    <path d="M6.6 13.6h10.8" />
    <path d="M5.4 9.4 3.2 7.2M18.6 9.4l2.2-2.2M3.2 7.2 4.6 5.6M20.8 7.2 19.4 5.6" />
    <path d="M7.4 16.4 5 18.4M16.6 16.4 19 18.4M10 17.2l-.8 2.4M14 17.2l.8 2.4" />
  </Svg>
);

/* Oyster / bivalve shell. */
export const IconShell = (p: P) => (
  <Svg {...p}>
    <path d="M12 19.4c-4.6 0-8.4-3.4-8.4-7.6 0-4.2 3.8-7.2 8.4-7.2s8.4 3 8.4 7.2c0 4.2-3.8 7.6-8.4 7.6Z" />
    <path d="M12 4.6v14.8M7.2 5.8 9.4 19M16.8 5.8 14.6 19" />
  </Svg>
);

/* Snail / periwinkle spiral. */
export const IconSpiral = (p: P) => (
  <Svg {...p}>
    <path d="M12 20a8 8 0 1 0-8-8 5.6 5.6 0 0 0 5.6 5.6A3.9 3.9 0 0 0 13.5 13.7 2.6 2.6 0 0 0 11 11.2a1.7 1.7 0 0 0-1.7 1.7" />
  </Svg>
);

/* Scales — the weight step of customisation. */
export const IconScale = (p: P) => (
  <Svg {...p}>
    <path d="M12 4.4v15.2M7.4 19.6h9.2" />
    <path d="M4 8.4h16" />
    <path d="M4 8.4 1.8 13.2a2.9 2.9 0 0 0 4.4 0L4 8.4ZM20 8.4l-2.2 4.8a2.9 2.9 0 0 0 4.4 0L20 8.4Z" />
    <circle cx="12" cy="5.4" r="1.4" />
  </Svg>
);

/* Knife — the preparation step. */
export const IconKnife = (p: P) => (
  <Svg {...p}>
    <path d="M4.4 15.2 15.8 3.8c.6 2.9.3 5.6-1 7.9-1.2 2.2-3 3.7-5.2 4.6l-5.2-1.1Z" />
    <path d="m9.6 16.3 4 4M12.9 14.4l2.6 2.6" />
  </Svg>
);

/* Van — delivery. */
export const IconVan = (p: P) => (
  <Svg {...p}>
    <path d="M2.6 16.4V7.6a1 1 0 0 1 1-1h9.6v9.8" />
    <path d="M13.2 9.6h3.6l3.6 3.4v3.4" />
    <circle cx="7.2" cy="17.6" r="1.9" />
    <circle cx="16.8" cy="17.6" r="1.9" />
    <path d="M9.1 17.6h5.8M2.6 16.4h2.7M18.7 16.4h1.7" />
  </Svg>
);

export const IconPin = (p: P) => (
  <Svg {...p}>
    <path d="M12 21c3.6-4.5 5.6-7.6 5.6-10.2A5.6 5.6 0 0 0 6.4 10.8C6.4 13.4 8.4 16.5 12 21Z" />
    <circle cx="12" cy="10.6" r="2.2" />
  </Svg>
);

export const IconCalendar = (p: P) => (
  <Svg {...p}>
    <rect x="3.8" y="5.6" width="16.4" height="14.6" rx="2.6" />
    <path d="M3.8 10h16.4M8.4 3.6v3.2M15.6 3.6v3.2" />
  </Svg>
);

export const IconClock = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.2" />
    <path d="M12 7.6V12l3 2" />
  </Svg>
);

export const IconSnow = (p: P) => (
  <Svg {...p}>
    <path d="M12 3.4v17.2M4.6 7.8l14.8 8.4M19.4 7.8 4.6 16.2" />
    <path d="M9.4 5.4 12 7.2l2.6-1.8M9.4 18.6 12 16.8l2.6 1.8" />
  </Svg>
);

export const IconShield = (p: P) => (
  <Svg {...p}>
    <path d="M12 3.4l7 2.6v6c0 4-2.9 7.2-7 8.6-4.1-1.4-7-4.6-7-8.6V6l7-2.6Z" />
    <path d="m8.8 12.2 2.3 2.3 4.1-4.6" />
  </Svg>
);

export const IconChat = (p: P) => (
  <Svg {...p}>
    <path d="M20.4 12.2c0 3.9-3.8 7-8.4 7a10 10 0 0 1-2.6-.3l-4.6 1.5 1.3-3.8a6.6 6.6 0 0 1-2.5-5c0-3.9 3.8-7 8.4-7s8.4 3.1 8.4 7Z" />
    <path d="M9 12.2h6" />
  </Svg>
);

export const IconInfo = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M12 11v5.4" />
    <circle cx="12" cy="8" r=".9" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconWarn = (p: P) => (
  <Svg {...p}>
    <path d="M12 4.2 21 19.4H3L12 4.2Z" />
    <path d="M12 10v4" />
    <circle cx="12" cy="16.8" r=".9" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconBox = (p: P) => (
  <Svg {...p}>
    <path d="M12 3.4 3.6 7.4v9.2L12 20.6l8.4-4V7.4L12 3.4Z" />
    <path d="M3.6 7.4 12 11.5l8.4-4.1M12 11.5v9.1" />
  </Svg>
);

export const IconBowl = (p: P) => (
  <Svg {...p}>
    <path d="M3.4 11.2h17.2c0 4.1-3.4 7.4-7.6 7.4h-2c-4.2 0-7.6-3.3-7.6-7.4Z" />
    <path d="M8.4 8.2c0-1.4 1-2 1-3.2M12 8c0-1.8 1.2-2.4 1.2-4M15.6 8.4c0-1.2.9-1.8.9-2.8" />
  </Svg>
);

export const IconTrash = (p: P) => (
  <Svg {...p}>
    <path d="M4.8 7.4h14.4M9.4 7.4V5.2h5.2v2.2" />
    <path d="M6.6 7.4l.9 11.4a1.6 1.6 0 0 0 1.6 1.4h5.8a1.6 1.6 0 0 0 1.6-1.4l.9-11.4" />
    <path d="M10.4 11v5.6M13.6 11v5.6" />
  </Svg>
);

export const IconEye = ({ off, ...p }: P & { off?: boolean }) => (
  <Svg {...p}>
    <path d="M2.6 12S6 6.6 12 6.6 21.4 12 21.4 12 18 17.4 12 17.4 2.6 12 2.6 12Z" />
    <circle cx="12" cy="12" r="2.8" />
    {off && <path d="m4 20 16-16" />}
  </Svg>
);

export const IconRepeat = (p: P) => (
  <Svg {...p}>
    <path d="M4.4 10.4A7.6 7.6 0 0 1 18 7.6l2 2M19.6 13.6A7.6 7.6 0 0 1 6 16.4l-2-2" />
    <path d="M20 5.2v4.4h-4.4M4 18.8v-4.4h4.4" />
  </Svg>
);

export const IconMenu = (p: P) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

export const IconStar = ({ filled, ...p }: P & { filled?: boolean }) => (
  <Svg {...p}>
    <path
      d="m12 4.4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4L4.2 10l5.4-.8L12 4.4Z"
      fill={filled ? "currentColor" : "none"}
    />
  </Svg>
);

export const IconCard = (p: P) => (
  <Svg {...p}>
    <rect x="2.8" y="5.4" width="18.4" height="13.2" rx="2.6" />
    <path d="M2.8 10h18.4M6.4 14.4h3.2" />
  </Svg>
);

export const IconBank = (p: P) => (
  <Svg {...p}>
    <path d="M3.4 9.6 12 4.4l8.6 5.2" />
    <path d="M5.6 9.6v8.8M12 9.6v8.8M18.4 9.6v8.8M3.4 19.6h17.2" />
  </Svg>
);

export const IconCash = (p: P) => (
  <Svg {...p}>
    <rect x="2.8" y="6.4" width="18.4" height="11.2" rx="2.2" />
    <circle cx="12" cy="12" r="2.6" />
    <path d="M6 12h.9M17.1 12h.9" />
  </Svg>
);

export const IconMoon = (p: P) => (
  <Svg {...p}>
    <path d="M20 14.4A8.4 8.4 0 0 1 9.6 4 8.4 8.4 0 1 0 20 14.4Z" />
  </Svg>
);

export const IconSun = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" />
  </Svg>
);

/* --- Brand mark ----------------------------------------------------------- *
   The ONEESTORE mark: a rising tide inside a rounded square, with the wave
   doubling as the "O". Drawn, not borrowed. */
export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden="true"
      focusable="false"
      style={{ flex: "0 0 auto" }}
    >
      <defs>
        <linearGradient id="os-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--tide-400)" />
          <stop offset="1" stopColor="var(--tide-700)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="12" fill="url(#os-mark)" />
      <path
        d="M8 25.5c2.6-3.4 5.2-3.4 8 0s5.4 3.4 8 0 5.4-3.4 8 0"
        fill="none"
        stroke="rgba(255,255,255,.95)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="20" cy="14.5" r="4.6" fill="none" stroke="rgba(255,255,255,.95)" strokeWidth="2.6" />
    </svg>
  );
}
