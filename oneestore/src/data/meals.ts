import type { Meal } from "./types";

/**
 * Meals are the discovery path for customers who know what they want to *eat*
 * but not what to buy. Each one carries a real shopping list with weights and
 * preparations already reasoned through — then the customer edits it.
 */
export const MEALS: Meal[] = [
  {
    id: "m-okra",
    slug: "seafood-okra",
    name: "Seafood Okra",
    tagline: "The full pot — prawns, periwinkle, smoked fish",
    serves: 6,
    minutes: 45,
    hue: 140,
    motif: "shell",
    about:
      "Okra done properly needs three kinds of seafood: something sweet, something chewy, something smoked. This is that combination, portioned for six with swallow.",
    tags: ["Family", "Soup", "Weekend"],
    items: [
      {
        productId: "p-river-prawns",
        grams: 500,
        prep: "shell-on",
        why: "Shells on — they carry the whole pot",
      },
      {
        productId: "p-periwinkle",
        grams: 500,
        prep: "cleaned",
        why: "For the chew and the brine",
      },
      {
        productId: "p-smoked-catfish",
        grams: 400,
        prep: "flaked",
        why: "The smoke layer, deboned so nobody hunts for bones",
      },
      {
        productId: "p-crayfish",
        grams: 200,
        prep: null,
        why: "Ground into the base",
      },
      {
        productId: "p-blue-crab",
        grams: 500,
        prep: "cracked",
        why: "Optional, but it changes the pot",
        optional: true,
      },
    ],
  },
  {
    id: "m-pasta",
    slug: "seafood-pasta",
    name: "Seafood Pasta",
    tagline: "Prawns, calamari, clams — 25 minutes",
    serves: 4,
    minutes: 25,
    hue: 24,
    motif: "prawn",
    about:
      "A weeknight version that still feels like a restaurant plate. Everything arrives peeled, ringed and purged, so the cooking is genuinely twenty-five minutes.",
    tags: ["Quick", "Weeknight", "Date night"],
    items: [
      {
        productId: "p-king-prawns",
        grams: 500,
        prep: "peeled-deveined",
        extras: ["portion-bags"],
        why: "Peeled and deveined so they go straight in the pan",
      },
      {
        productId: "p-calamari",
        grams: 400,
        prep: "rings",
        why: "Rings — two minutes, no more",
      },
      {
        productId: "p-clams",
        grams: 500,
        prep: "cleaned",
        why: "They open into the sauce and season it",
      },
    ],
  },
  {
    id: "m-pepper-soup",
    slug: "catfish-pepper-soup",
    name: "Catfish Pepper Soup",
    tagline: "Hot, clean, restorative",
    serves: 4,
    minutes: 35,
    hue: 6,
    motif: "fish",
    about:
      "One fish, cut across the bone, and nothing to hide behind. We clean the catfish properly — the slime is the whole job — and cut it into soup rounds.",
    tags: ["Comfort", "Light", "Rainy day"],
    items: [
      {
        productId: "p-catfish",
        grams: 1500,
        prep: "steak",
        extras: ["head-on"],
        why: "Steak cut with the head in — the head is the flavour",
      },
      {
        productId: "p-crayfish",
        grams: 200,
        prep: null,
        why: "A spoon into the broth",
      },
      {
        productId: "p-river-prawns",
        grams: 250,
        prep: "shell-on",
        why: "Optional depth",
        optional: true,
      },
    ],
  },
  {
    id: "m-boil",
    slug: "seafood-boil",
    name: "Seafood Boil",
    tagline: "One pot, hands in, for six",
    serves: 6,
    minutes: 50,
    hue: 340,
    motif: "crab",
    about:
      "Everything goes in the pot, then onto the table on newspaper. Crab cracked in advance, prawns shell-on, clams purged. Designed for a crowd who do not mind getting messy.",
    tags: ["Party", "Crowd", "Sharing"],
    items: [
      {
        productId: "p-tiger-prawns",
        grams: 1000,
        prep: "shell-on",
        extras: ["butterfly-cut"],
        why: "Shell on, butterflied so the spice gets in",
      },
      {
        productId: "p-blue-crab",
        grams: 1000,
        prep: "cracked",
        why: "Cracked in the kitchen, not at the table",
      },
      {
        productId: "p-clams",
        grams: 1000,
        prep: "cleaned",
        why: "Go in last, come out open",
      },
      {
        productId: "p-lobster",
        grams: 800,
        prep: "butterflied",
        why: "If it is that kind of evening",
        optional: true,
      },
    ],
  },
  {
    id: "m-grill",
    slug: "grilled-fish-platter",
    name: "Grilled Fish Platter",
    tagline: "Two whole fish, butterflied for coals",
    serves: 4,
    minutes: 40,
    hue: 196,
    motif: "fish",
    about:
      "Butterflied fish cooks in half the time and takes marinade far better. We open them flat and score the skin so the pepper actually reaches the flesh.",
    tags: ["Grill", "Outdoors", "Weekend"],
    items: [
      {
        productId: "p-snapper",
        grams: 1200,
        prep: "butterflied",
        extras: ["scaled", "head-on"],
        why: "Opened flat, scales off, head on for the plate",
      },
      {
        productId: "p-tilapia",
        grams: 1000,
        prep: "butterflied",
        extras: ["scaled"],
        why: "The second fish, so nobody fights",
      },
      {
        productId: "p-king-prawns",
        grams: 500,
        prep: "shell-on",
        why: "Skewered alongside",
        optional: true,
      },
    ],
  },
  {
    id: "m-jollof",
    slug: "seafood-jollof",
    name: "Seafood Jollof",
    tagline: "Prawns and smoked fish through the rice",
    serves: 6,
    minutes: 55,
    hue: 20,
    motif: "prawn",
    about:
      "Prawns stirred in at the end so they stay sweet, smoked fish flaked through the middle so every plate gets some.",
    tags: ["Family", "Rice", "Celebration"],
    items: [
      {
        productId: "p-king-prawns",
        grams: 750,
        prep: "peeled-deveined",
        why: "Peeled — nobody wants shells in rice",
      },
      {
        productId: "p-smoked-catfish",
        grams: 400,
        prep: "flaked",
        why: "Flaked through so it disappears into the rice",
      },
      {
        productId: "p-crayfish",
        grams: 250,
        prep: null,
        why: "In the base",
      },
    ],
  },
];

export function mealBySlug(slug: string): Meal | undefined {
  return MEALS.find((m) => m.slug === slug);
}
