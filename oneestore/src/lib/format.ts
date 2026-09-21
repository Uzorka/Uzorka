/** Formatting helpers. Money and weight are the two things a seafood customer
 *  reads most, so they get one implementation each and never a local variant. */

const NAIRA = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

/** ₦18,500 — no kobo. Prices here are whole naira. */
export function money(n: number): string {
  return NAIRA.format(Math.max(0, Math.round(n)));
}

/** 500 g / 1.5 kg — switches unit where a human would. */
export function weight(grams: number): string {
  if (grams < 1000) return `${Math.round(grams)} g`;
  const kg = grams / 1000;
  return `${kg % 1 === 0 ? kg.toFixed(0) : kg.toFixed(kg < 10 ? 1 : 0)} kg`;
}

/** "Tue 22 Sep" */
export function dayLabel(d: Date): string {
  return d.toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** "MON" / "TUE" — the date selector's top line. */
export function dayShort(d: Date): string {
  return d.toLocaleDateString("en-NG", { weekday: "short" }).slice(0, 3).toUpperCase();
}

/** "14:32" */
export function timeLabel(iso: string | number | Date): string {
  return new Date(iso).toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** "Today, 14:32" / "Tue 22 Sep, 14:32" */
export function stampLabel(iso: string | number | Date): string {
  const d = new Date(iso);
  const today = new Date();
  const same =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  return `${same ? "Today" : dayLabel(d)}, ${timeLabel(d)}`;
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** Phone auto-format for Nigerian mobile numbers: 0803 123 4567 */
export function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 4) return d;
  if (d.length <= 7) return `${d.slice(0, 4)} ${d.slice(4)}`;
  return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
}

/** Card number auto-format: 4 digit groups. */
export function formatCard(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 16);
  return d.replace(/(.{4})/g, "$1 ").trim();
}

/** Expiry auto-format: MM/YY */
export function formatExpiry(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}
