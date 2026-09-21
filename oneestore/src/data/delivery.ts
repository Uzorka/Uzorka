import type { OrderStage, Zone } from "./types";

/* ============================================================================
   Lagos delivery zones.
   An unserved zone is never a dead end — it names why and offers the nearest
   alternatives, because "we don't deliver there" with no next step is useless.
   ========================================================================== */

export const ZONES: Zone[] = [
  { id: "z-lekki1", name: "Lekki Phase 1", area: "Lekki", fee: 2500, cutoff: "11:00", served: true },
  { id: "z-vi", name: "Victoria Island", area: "Island", fee: 2500, cutoff: "11:00", served: true },
  { id: "z-ikoyi", name: "Ikoyi", area: "Island", fee: 2500, cutoff: "11:00", served: true },
  { id: "z-ajah", name: "Ajah & Sangotedo", area: "Lekki", fee: 3500, cutoff: "10:00", served: true },
  { id: "z-chevron", name: "Chevron & Orchid", area: "Lekki", fee: 3000, cutoff: "10:30", served: true },
  { id: "z-ikeja", name: "Ikeja & GRA", area: "Mainland", fee: 3000, cutoff: "10:00", served: true },
  { id: "z-yaba", name: "Yaba & Surulere", area: "Mainland", fee: 3000, cutoff: "10:00", served: true },
  { id: "z-gbagada", name: "Gbagada & Anthony", area: "Mainland", fee: 3200, cutoff: "10:00", served: true },
  { id: "z-magodo", name: "Magodo & Ketu", area: "Mainland", fee: 3500, cutoff: "10:00", served: true },
  { id: "z-festac", name: "Festac & Amuwo", area: "Mainland", fee: 4000, cutoff: "09:30", served: true },
  {
    id: "z-ikorodu",
    name: "Ikorodu",
    area: "Outer",
    fee: 0,
    cutoff: "—",
    served: false,
    note: "Our vans do not reach Ikorodu yet. We are adding it next quarter.",
    alternatives: ["z-magodo", "z-gbagada"],
  },
  {
    id: "z-badagry",
    name: "Badagry",
    area: "Outer",
    fee: 0,
    cutoff: "—",
    served: false,
    note: "Badagry is outside our delivery radius — the cold chain cannot hold that long.",
    alternatives: ["z-festac"],
  },
  {
    id: "z-epe",
    name: "Epe",
    area: "Outer",
    fee: 0,
    cutoff: "—",
    served: false,
    note: "Epe is where a lot of our fish lands, but we do not run a delivery route back out yet.",
    alternatives: ["z-ajah"],
  },
];

export function zoneById(id: string): Zone | undefined {
  return ZONES.find((z) => z.id === id);
}
export const SERVED_ZONES = ZONES.filter((z) => z.served);

/* ============================================================================
   Delivery slots.
   Availability is generated rather than hard-coded so the calendar is never
   stale: Sundays are closed, and one weekday is deliberately full to exercise
   the "unavailable, and here is why" state.
   ========================================================================== */

export type Slot = {
  date: string; // yyyy-mm-dd
  day: Date;
  available: boolean;
  reason?: string;
  windows: { id: string; label: string; note?: string; full?: boolean }[];
};

const WINDOWS = [
  { id: "am", label: "9:00 – 12:00", note: "Morning" },
  { id: "mid", label: "12:00 – 15:00", note: "Midday" },
  { id: "pm", label: "15:00 – 18:00", note: "Afternoon" },
  { id: "eve", label: "18:00 – 21:00", note: "Evening" },
];

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/** 14 days from today. Day 0 is today; before 11:00 it is still orderable. */
export function buildSlots(from = new Date()): Slot[] {
  const out: Slot[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(from);
    d.setDate(from.getDate() + i);
    d.setHours(0, 0, 0, 0);
    const dow = d.getDay();

    let available = true;
    let reason: string | undefined;

    if (dow === 0) {
      available = false;
      reason = "We do not deliver on Sundays — the market is closed on Saturday night.";
    } else if (i === 0 && from.getHours() >= 11) {
      available = false;
      reason = "Today's vans have left. The 11:00 cut-off has passed.";
    } else if (i === 2) {
      available = false;
      reason = "Fully booked. Every van on this day is already assigned.";
    }

    out.push({
      date: iso(d),
      day: d,
      available,
      reason,
      windows: WINDOWS.map((w) => ({
        ...w,
        // Late slots on the first available day fill up first, realistically.
        full: i === 1 && w.id === "am",
      })),
    });
  }
  return out;
}

/* ============================================================================
   Order stages.
   Customer-facing language only: no "procurement", no "supplier", no internal
   workflow names. ONEESTORE absorbs that complexity.
   ========================================================================== */

export const STAGES: OrderStage[] = [
  {
    id: "confirmed",
    label: "Order confirmed",
    detail: "We have your order and your delivery slot is held.",
  },
  {
    id: "sourcing",
    label: "Sourcing your seafood",
    detail: "Picking your items fresh for your delivery day.",
  },
  {
    id: "checked",
    label: "Quality checked",
    detail: "Each item inspected for freshness, smell and firmness.",
  },
  {
    id: "preparing",
    label: "Preparing",
    detail: "Cleaning, cutting and portioning exactly as you asked.",
  },
  {
    id: "packed",
    label: "Packed and chilled",
    detail: "Sealed, iced and weighed for the van.",
  },
  {
    id: "out",
    label: "Out for delivery",
    detail: "On its way to you inside your chosen window.",
  },
  {
    id: "delivered",
    label: "Delivered",
    detail: "Handed over. Enjoy it — and tell us if anything was off.",
  },
];

export const PAYMENT_METHODS = [
  {
    id: "card",
    label: "Card",
    note: "Visa, Mastercard, Verve",
  },
  {
    id: "transfer",
    label: "Bank transfer",
    note: "We hold your slot for 30 minutes",
  },
  {
    id: "delivery",
    label: "Pay on delivery",
    note: "Card or transfer to the rider",
  },
] as const;
