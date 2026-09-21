import { EXTRAS, PREPS, productById } from "../data/catalog";
import type { CartLine, ExtraId, PrepId, Product } from "../data/types";

/**
 * Pricing and yield.
 *
 * Every number the customer sees — unit price, line total, prepared weight,
 * basket subtotal — comes from these four functions, so the product page, the
 * customisation sheet, the basket and the order confirmation can never disagree.
 */

/** Naira for one unit at this configuration. */
export function unitPrice(
  product: Product,
  grams: number,
  prep: PrepId | null,
  extras: ExtraId[]
): number {
  const kg = grams / 1000;
  const prepPerKg = prep ? PREPS[prep].perKg : 0;
  const extrasFlat = extras.reduce((sum, id) => sum + (EXTRAS[id]?.price ?? 0), 0);
  return Math.round((product.pricePerKg + prepPerKg) * kg + extrasFlat);
}

/**
 * Estimated weight of edible seafood after preparation.
 *
 * This is the number that stops a customer being disappointed: 1 kg of croaker
 * filleted is about 520 g on the plate. We say so before they buy.
 */
export function preparedWeight(
  grams: number,
  prep: PrepId | null,
  extras: ExtraId[]
): number {
  const base = prep ? PREPS[prep].yield : 1;
  const extraFactor = extras.reduce(
    (f, id) => f * (EXTRAS[id]?.yieldFactor ?? 1),
    1
  );
  return Math.round(grams * base * extraFactor);
}

/** True when preparation meaningfully changes what arrives. */
export function yieldIsNotable(
  grams: number,
  prep: PrepId | null,
  extras: ExtraId[]
): boolean {
  return preparedWeight(grams, prep, extras) < grams * 0.97;
}

export function linePrice(line: CartLine): number {
  const p = productById(line.productId);
  if (!p) return 0;
  return unitPrice(p, line.grams, line.prep, line.extras) * line.qty;
}

export function lineWeight(line: CartLine): number {
  return line.grams * line.qty;
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + linePrice(l), 0);
}

export function cartWeight(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + lineWeight(l), 0);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.qty, 0);
}

/** Free delivery over this subtotal — stated, never a surprise. */
export const FREE_DELIVERY_OVER = 60000;

export function deliveryFee(subtotal: number, zoneFee: number): number {
  if (subtotal >= FREE_DELIVERY_OVER) return 0;
  return zoneFee;
}

/** A stable signature for "same product, same configuration", so re-adding the
 *  same thing bumps quantity instead of stacking near-duplicate lines. */
export function lineSignature(
  productId: string,
  grams: number,
  prep: PrepId | null,
  extras: ExtraId[]
): string {
  return [productId, grams, prep ?? "-", [...extras].sort().join("+")].join("|");
}

/** The default, safe configuration for a product.
 *  Rule: never preselect anything that costs money. Free majority-choice
 *  extras are on; paid extras are off; a required prep is left unchosen. */
export function defaultConfig(
  product: Product,
  remembered?: PrepId | null
): { grams: number; prep: PrepId | null; extras: ExtraId[] } {
  const prep =
    remembered && product.preps.includes(remembered)
      ? remembered
      : product.prepRequired
        ? null
        : (product.preps[0] ?? null);
  return {
    grams: product.weights[Math.min(1, product.weights.length - 1)],
    prep,
    extras: product.extras.filter((id) => EXTRAS[id]?.defaultOn && EXTRAS[id].price === 0),
  };
}

/** Human summary of a configuration: "1 kg · Filleted · Skin removed". */
export function configSummary(
  grams: number,
  prep: PrepId | null,
  extras: ExtraId[],
  weightLabel: (g: number) => string
): string {
  const bits = [weightLabel(grams)];
  if (prep) bits.push(PREPS[prep].label);
  extras.forEach((id) => {
    const e = EXTRAS[id];
    if (e) bits.push(e.label);
  });
  return bits.join(" · ");
}
