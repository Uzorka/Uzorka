/** ONEESTORE domain types. */

export type CategoryId =
  | "fish"
  | "prawns"
  | "crab-lobster"
  | "shellfish"
  | "squid-octopus"
  | "smoked-dried";

export type Category = {
  id: CategoryId;
  name: string;
  short: string;
  blurb: string;
  motif: MotifId;
  hue: number;
};

/** The abstract art motif used for a product's image tile. */
export type MotifId = "fish" | "prawn" | "crab" | "shell" | "spiral" | "smoke";

export type PrepId =
  | "whole"
  | "gutted"
  | "cleaned"
  | "filleted"
  | "steak"
  | "butterflied"
  | "shell-on"
  | "peeled"
  | "peeled-deveined"
  | "cracked"
  | "rings"
  | "flaked";

/**
 * A preparation option.
 *
 * `yield` is the honest part: filleting a 1 kg croaker hands you ~520 g of
 * edible fish. ONEESTORE shows that estimate live rather than letting a
 * customer discover it when the box arrives.
 *
 * `perKg` is the added handling charge, in naira per kilogram of raw weight.
 */
export type Prep = {
  id: PrepId;
  label: string;
  note: string;
  yield: number;
  perKg: number;
};

export type ExtraId =
  | "head-on"
  | "head-off"
  | "scaled"
  | "skin-off"
  | "deveined"
  | "butterfly-cut"
  | "portion-bags"
  | "vacuum-sealed"
  | "extra-ice";

export type Extra = {
  id: ExtraId;
  label: string;
  note?: string;
  /** Flat naira added to the line. 0 = free preference. */
  price: number;
  /** Multiplies the prepared-weight estimate (removing heads costs weight). */
  yieldFactor?: number;
  /** Safe to preselect: free, reversible, and what most people want. */
  defaultOn?: boolean;
};

export type Availability = "fresh" | "limited" | "preorder" | "out";

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: CategoryId;
  /** Naira per kilogram of raw weight. */
  pricePerKg: number;
  /** Preset weight buttons, in grams. */
  weights: number[];
  minWeight: number;
  maxWeight: number;
  preps: PrepId[];
  /** When true, the customer must choose a prep — quick-add opens the sheet. */
  prepRequired: boolean;
  extras: ExtraId[];
  availability: Availability;
  /** Kilograms on hand today. Drives "only 4 kg left". */
  stockKg: number;
  origin: string;
  about: string;
  storage: string;
  rating: number;
  reviews: number;
  /** Rough count per kg, where counting is how people think (prawns, crabs). */
  perKg?: string;
  badges?: string[];
  motif: MotifId;
  hue: number;
  /** Sort key for "Most popular". */
  popularity: number;
  /** Unix-ish freshness marker: hours since landing. */
  landedHoursAgo: number;
};

export type CartLine = {
  id: string;
  productId: string;
  grams: number;
  prep: PrepId | null;
  extras: ExtraId[];
  qty: number;
  /** Set when the line came from a meal or a box, for grouping in the basket. */
  source?: { kind: "meal" | "box"; label: string };
};

export type MealItem = {
  productId: string;
  grams: number;
  prep: PrepId | null;
  extras?: ExtraId[];
  /** Why this is in the recipe — shown in the meal builder. */
  why: string;
  optional?: boolean;
};

export type Meal = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  serves: number;
  minutes: number;
  hue: number;
  motif: MotifId;
  about: string;
  items: MealItem[];
  tags: string[];
};

export type Zone = {
  id: string;
  name: string;
  area: string;
  fee: number;
  /** Same-day cut-off, 24h clock. */
  cutoff: string;
  served: boolean;
  /** Shown when `served` is false — never a bare error. */
  note?: string;
  /** Nearby served zones to offer as an alternative. */
  alternatives?: string[];
};

export type OrderStageId =
  | "confirmed"
  | "sourcing"
  | "checked"
  | "preparing"
  | "packed"
  | "out"
  | "delivered";

export type OrderStage = {
  id: OrderStageId;
  label: string;
  /** Customer-facing explanation — no internal procurement language. */
  detail: string;
};

export type Order = {
  no: string;
  placedAt: number;
  lines: CartLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  zoneId: string;
  address: string;
  contact: { name: string; phone: string; email: string };
  slotDate: string;
  slotWindow: string;
  payment: string;
  /** Index into STAGES. */
  stage: number;
  /** Timestamps per reached stage. */
  stamps: Partial<Record<OrderStageId, number>>;
  issue?: { kind: string; message: string; at: number };
};
