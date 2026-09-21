import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { PRODUCTS, productById } from "../data/catalog";
import { STAGES } from "../data/delivery";
import type { CartLine, Order, OrderStageId, PrepId } from "../data/types";
import { uid } from "../lib/id";
import { load, save } from "../lib/storage";
import { cartSubtotal, lineSignature } from "./pricing";

/* ============================================================================
   Shape
   ========================================================================== */

export type Prefs = {
  /** Remembered preparation per product — "you usually ask for filleted". */
  preps: Record<string, PrepId>;
  /** Saved contact and delivery details, so a returning customer types nothing. */
  contact: { name: string; phone: string; email: string } | null;
  address: { line: string; zoneId: string; instructions: string } | null;
  theme: "system" | "light" | "dark";
  /** Search history, newest first. */
  recentSearches: string[];
  /** Seen the welcome guidance? New customers get discovery, not shortcuts. */
  returning: boolean;
};

export type State = {
  cart: CartLine[];
  favourites: string[];
  orders: Order[];
  prefs: Prefs;
  /** Build Your Box draft: product id → grams. */
  box: Record<string, number>;
  boxSize: "small" | "medium" | "large";
};

const EMPTY_PREFS: Prefs = {
  preps: {},
  contact: null,
  address: null,
  theme: "system",
  recentSearches: [],
  returning: false,
};

type Action =
  | { type: "cart/add"; line: Omit<CartLine, "id"> }
  | { type: "cart/qty"; id: string; qty: number }
  | { type: "cart/remove"; id: string }
  | { type: "cart/update"; id: string; patch: Partial<CartLine> }
  | { type: "cart/clear" }
  | { type: "fav/toggle"; productId: string }
  | { type: "box/set"; productId: string; grams: number }
  | { type: "box/remove"; productId: string }
  | { type: "box/clear" }
  | { type: "box/size"; size: State["boxSize"] }
  | { type: "prefs/patch"; patch: Partial<Prefs> }
  | { type: "prefs/prep"; productId: string; prep: PrepId }
  | { type: "prefs/search"; term: string }
  | { type: "order/place"; order: Order }
  | { type: "order/advance"; no: string; stage: number; stamp: OrderStageId }
  | { type: "order/issue"; no: string; kind: string; message: string }
  | { type: "hydrate"; state: State };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return action.state;

    case "cart/add": {
      const { line } = action;
      const sig = lineSignature(line.productId, line.grams, line.prep, line.extras);
      const existing = state.cart.find(
        (l) => lineSignature(l.productId, l.grams, l.prep, l.extras) === sig
      );
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((l) =>
            l.id === existing.id ? { ...l, qty: l.qty + line.qty } : l
          ),
        };
      }
      return { ...state, cart: [...state.cart, { ...line, id: uid("l") }] };
    }

    case "cart/qty": {
      if (action.qty <= 0) {
        return { ...state, cart: state.cart.filter((l) => l.id !== action.id) };
      }
      return {
        ...state,
        cart: state.cart.map((l) =>
          l.id === action.id ? { ...l, qty: Math.min(99, action.qty) } : l
        ),
      };
    }

    case "cart/remove":
      return { ...state, cart: state.cart.filter((l) => l.id !== action.id) };

    case "cart/update":
      return {
        ...state,
        cart: state.cart.map((l) =>
          l.id === action.id ? { ...l, ...action.patch } : l
        ),
      };

    case "cart/clear":
      return { ...state, cart: [] };

    case "fav/toggle":
      return {
        ...state,
        favourites: state.favourites.includes(action.productId)
          ? state.favourites.filter((id) => id !== action.productId)
          : [action.productId, ...state.favourites],
      };

    case "box/set":
      return { ...state, box: { ...state.box, [action.productId]: action.grams } };

    case "box/remove": {
      const next = { ...state.box };
      delete next[action.productId];
      return { ...state, box: next };
    }

    case "box/clear":
      return { ...state, box: {} };

    case "box/size":
      return { ...state, boxSize: action.size };

    case "prefs/patch":
      return { ...state, prefs: { ...state.prefs, ...action.patch } };

    case "prefs/prep":
      return {
        ...state,
        prefs: {
          ...state.prefs,
          preps: { ...state.prefs.preps, [action.productId]: action.prep },
        },
      };

    case "prefs/search": {
      const term = action.term.trim();
      if (!term) return state;
      const next = [
        term,
        ...state.prefs.recentSearches.filter(
          (t) => t.toLowerCase() !== term.toLowerCase()
        ),
      ].slice(0, 6);
      return { ...state, prefs: { ...state.prefs, recentSearches: next } };
    }

    case "order/place":
      return {
        ...state,
        orders: [action.order, ...state.orders],
        cart: [],
        box: {},
        prefs: { ...state.prefs, returning: true },
      };

    case "order/advance":
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.no === action.no
            ? {
                ...o,
                stage: action.stage,
                stamps: { ...o.stamps, [action.stamp]: Date.now() },
              }
            : o
        ),
      };

    case "order/issue":
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.no === action.no
            ? {
                ...o,
                issue: { kind: action.kind, message: action.message, at: Date.now() },
              }
            : o
        ),
      };

    default:
      return state;
  }
}

const INITIAL: State = {
  cart: [],
  favourites: [],
  orders: [],
  prefs: EMPTY_PREFS,
  box: {},
  boxSize: "medium",
};

/* ============================================================================
   Overlay layer
   One place decides what is open, so a sheet can never end up behind a drawer
   and Escape always closes the innermost thing.
   ========================================================================== */

export type Overlay =
  | { kind: "none" }
  | { kind: "search" }
  | { kind: "cart" }
  | { kind: "customize"; productId: string; lineId?: string }
  | { kind: "filters" }
  | { kind: "sort" }
  | { kind: "address" }
  | { kind: "date" }
  | { kind: "menu" }
  | { kind: "added"; productId: string; grams: number }
  | { kind: "command" };

export type Toast = {
  id: string;
  title: string;
  body?: string;
  tone?: "ok" | "info" | "bad";
  action?: { label: string; run: () => void };
};

type Ctx = {
  state: State;
  dispatch: React.Dispatch<Action>;
  overlay: Overlay;
  openOverlay: (o: Overlay) => void;
  closeOverlay: () => void;
  toasts: Toast[];
  toast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
  /** The cart button's DOM node, so items can fly into it. */
  cartAnchor: React.MutableRefObject<HTMLElement | null>;
  /** Bumps whenever a line is added — drives the badge animation. */
  cartPulse: number;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const [overlay, setOverlay] = useState<Overlay>({ kind: "none" });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [cartPulse, setCartPulse] = useState(0);
  const cartAnchor = useRef<HTMLElement | null>(null);
  const hydrated = useRef(false);
  const prevCount = useRef(0);

  /* --- Rehydrate once, then persist on change --------------------------- */
  useEffect(() => {
    const saved = load<State | null>("state", null);
    if (saved) {
      dispatch({
        type: "hydrate",
        state: {
          ...INITIAL,
          ...saved,
          prefs: { ...EMPTY_PREFS, ...saved.prefs },
          // Drop lines whose product has since left the catalogue.
          cart: (saved.cart ?? []).filter((l) => productById(l.productId)),
        },
      });
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (hydrated.current) save("state", state);
  }, [state]);

  /* --- Theme ------------------------------------------------------------- */
  useEffect(() => {
    const root = document.documentElement;
    if (state.prefs.theme === "system") root.removeAttribute("data-theme");
    else root.dataset.theme = state.prefs.theme;
  }, [state.prefs.theme]);

  /* --- Cart badge pulse -------------------------------------------------- */
  const count = state.cart.reduce((s, l) => s + l.qty, 0);
  useEffect(() => {
    if (count > prevCount.current) setCartPulse((n) => n + 1);
    prevCount.current = count;
  }, [count]);

  /* --- Toasts ------------------------------------------------------------ */
  const dismissToast = useCallback((id: string) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = uid("t");
      setToasts((list) => [...list.slice(-2), { ...t, id }]);
      window.setTimeout(() => dismissToast(id), t.action ? 6000 : 3800);
    },
    [dismissToast]
  );

  const openOverlay = useCallback((o: Overlay) => setOverlay(o), []);
  const closeOverlay = useCallback(() => setOverlay({ kind: "none" }), []);

  const value = useMemo<Ctx>(
    () => ({
      state,
      dispatch,
      overlay,
      openOverlay,
      closeOverlay,
      toasts,
      toast,
      dismissToast,
      cartAnchor,
      cartPulse,
    }),
    [state, overlay, openOverlay, closeOverlay, toasts, toast, dismissToast, cartPulse]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Ctx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

/* ============================================================================
   Derived selectors
   ========================================================================== */

export function useCart() {
  const { state } = useStore();
  return state.cart;
}

export function useCartTotals() {
  const { state } = useStore();
  return useMemo(() => {
    const subtotal = cartSubtotal(state.cart);
    const count = state.cart.reduce((s, l) => s + l.qty, 0);
    const grams = state.cart.reduce((s, l) => s + l.grams * l.qty, 0);
    return { subtotal, count, grams };
  }, [state.cart]);
}

export function useFavourite(productId: string) {
  const { state, dispatch } = useStore();
  const on = state.favourites.includes(productId);
  const toggle = useCallback(
    () => dispatch({ type: "fav/toggle", productId }),
    [dispatch, productId]
  );
  return [on, toggle] as const;
}

/** Products a returning customer has bought before — powers "Order again". */
export function usePreviouslyBought() {
  const { state } = useStore();
  return useMemo(() => {
    const ids = new Set<string>();
    state.orders.forEach((o) => o.lines.forEach((l) => ids.add(l.productId)));
    return [...ids].map(productById).filter(Boolean).slice(0, 8) as NonNullable<
      ReturnType<typeof productById>
    >[];
  }, [state.orders]);
}

/**
 * Advances live orders over time so tracking feels alive rather than static.
 * Each stage takes a plausible slice of the run-up to delivery; nothing jumps.
 */
export function useOrderProgress() {
  const { state, dispatch } = useStore();
  const orders = state.orders;

  useEffect(() => {
    const live = orders.filter((o) => o.stage < STAGES.length - 1);
    if (live.length === 0) return;

    const tick = () => {
      live.forEach((o) => {
        const next = o.stage + 1;
        if (next >= STAGES.length) return;
        // 18s per stage in this build so the flow is demonstrable end to end.
        const due = o.placedAt + next * 18000;
        if (Date.now() >= due) {
          dispatch({
            type: "order/advance",
            no: o.no,
            stage: next,
            stamp: STAGES[next].id,
          });
        }
      });
    };

    const t = window.setInterval(tick, 2000);
    tick();
    return () => window.clearInterval(t);
  }, [orders, dispatch]);
}

/** Cart helpers that every add-to-basket path funnels through. */
export function useAddToCart() {
  const { dispatch, toast, openOverlay } = useStore();
  return useCallback(
    (
      line: Omit<CartLine, "id">,
      opts: { silent?: boolean; confirm?: boolean } = {}
    ) => {
      dispatch({ type: "cart/add", line });
      if (line.prep) {
        dispatch({ type: "prefs/prep", productId: line.productId, prep: line.prep });
      }
      if (opts.confirm) {
        openOverlay({ kind: "added", productId: line.productId, grams: line.grams });
      } else if (!opts.silent) {
        const p = productById(line.productId);
        toast({ title: "Added to your basket", body: p?.name, tone: "ok" });
      }
    },
    [dispatch, toast, openOverlay]
  );
}

/** Seeds a demo order history the first time an admin view needs one. */
export function demoOrders(): Order[] {
  const now = Date.now();
  const pick = (i: number) => PRODUCTS[i];
  return [
    {
      no: "OS-K4T92",
      placedAt: now - 1000 * 60 * 42,
      lines: [
        {
          id: "d1",
          productId: pick(0).id,
          grams: 2000,
          prep: "cleaned",
          extras: ["head-on", "scaled"],
          qty: 1,
        },
        {
          id: "d2",
          productId: pick(8).id,
          grams: 1000,
          prep: "peeled-deveined",
          extras: ["portion-bags"],
          qty: 1,
        },
      ],
      subtotal: 41200,
      deliveryFee: 2500,
      total: 43700,
      zoneId: "z-lekki1",
      address: "14 Fola Osibo, Lekki Phase 1",
      contact: { name: "Amaka O.", phone: "0803 411 2290", email: "amaka@example.com" },
      slotDate: new Date(now + 86400000).toISOString().slice(0, 10),
      slotWindow: "9:00 – 12:00",
      payment: "Card",
      stage: 3,
      stamps: {
        confirmed: now - 1000 * 60 * 42,
        sourcing: now - 1000 * 60 * 33,
        checked: now - 1000 * 60 * 21,
        preparing: now - 1000 * 60 * 8,
      },
    },
  ];
}
