import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CATEGORIES,
  PRODUCTS,
  availabilityLabel,
  categoryOf,
  searchTerms,
} from "../data/catalog";
import type { Product } from "../data/types";
import {
  IconChevronRight,
  IconClose,
  IconSearch,
  IconSpark,
} from "../design/icons";
import { DUR } from "../design/motion";
import { money } from "../lib/format";
import { useDebounced, useEscape, usePresence, useScrollLock } from "../lib/hooks";
import { useNavigate } from "../lib/router";
import { useStore } from "../state/store";
import { Badge } from "./Bits";
import { IconButton } from "./Button";
import { ProductArt } from "./ProductArt";

/* ============================================================================
   SearchOverlay

   Three states, one surface, animated between rather than swapped:

     idle     — recent searches, popular seafood, categories
     typing   — product suggestions with image, price and category
     empty    — a real explanation and a way forward, never "no results"

   The field is focused on open and the results update as you type, so "praw"
   surfaces Tiger Prawns, King Prawns and the Prawns & Shrimp category before
   you finish the word.
   ========================================================================== */

const POPULAR = ["p-tiger-prawns", "p-croaker", "p-smoked-catfish", "p-blue-crab"];

function matches(q: string): { products: Product[]; cats: typeof CATEGORIES } {
  const term = q.trim().toLowerCase();
  if (!term) return { products: [], cats: [] };

  const scored = PRODUCTS.map((p) => {
    const hay = searchTerms(p);
    const name = p.name.toLowerCase();
    let score = 0;
    if (name.startsWith(term)) score += 100;
    else if (name.includes(term)) score += 70;
    if (hay.includes(term)) score += 30;
    // Word-start matches beat mid-word ones: "praw" should find Prawns first.
    if (new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(hay))
      score += 25;
    score += p.popularity / 20;
    return { p, score: hay.includes(term) || name.includes(term) ? score : 0 };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const cats = CATEGORIES.filter(
    (c) =>
      c.name.toLowerCase().includes(term) || c.short.toLowerCase().includes(term)
  );

  return { products: scored.slice(0, 8).map((x) => x.p), cats };
}

export function SearchOverlay() {
  const { overlay, closeOverlay, state, dispatch } = useStore();
  const open = overlay.kind === "search";
  const [mounted, presence] = usePresence(open, DUR.modal);
  const [q, setQ] = useState("");
  const debounced = useDebounced(q, 110);
  const inputRef = useRef<HTMLInputElement>(null);
  const nav = useNavigate();
  useScrollLock(mounted);
  useEscape(open, closeOverlay);

  // Focus after the entry animation starts, so the keyboard and the motion
  // don't fight each other on mobile.
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 90);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const { products, cats } = useMemo(() => matches(debounced), [debounced]);
  const typing = debounced.trim().length > 0;
  const nothing = typing && products.length === 0 && cats.length === 0;

  const commit = (to: string, term?: string) => {
    if (term) dispatch({ type: "prefs/search", term });
    closeOverlay();
    nav(to);
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className={`searchov ${presence === "open" ? "is-open" : "is-closing"}`}
      role="dialog"
      aria-modal="true"
      aria-label="Search seafood"
    >
      <div className="searchov__scrim" onClick={closeOverlay} aria-hidden="true" />

      <div className="searchov__panel glass glass--sheet">
        <form
          className="searchov__bar"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            if (products[0]) commit(`/p/${products[0].slug}`, q);
            else if (q.trim()) commit(`/shop?q=${encodeURIComponent(q.trim())}`, q);
          }}
        >
          <IconSearch size={20} className="searchov__glyph" />
          <input
            ref={inputRef}
            type="search"
            className="searchov__input"
            placeholder="Prawns, croaker, smoked catfish…"
            aria-label="Search seafood"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            enterKeyHint="search"
            autoComplete="off"
          />
          {q && (
            <IconButton
              label="Clear search"
              variant="soft"
              size="sm"
              onClick={() => {
                setQ("");
                inputRef.current?.focus();
              }}
            >
              <IconClose size={16} />
            </IconButton>
          )}
          <button type="button" className="searchov__cancel" onClick={closeOverlay}>
            Cancel
          </button>
        </form>

        <div className="searchov__body">
          {/* --- Idle -------------------------------------------------------- */}
          {!typing && (
            <div className="searchov__state">
              {state.prefs.recentSearches.length > 0 && (
                <section className="searchov__sec">
                  <h3 className="searchov__h">Recent searches</h3>
                  <div className="searchov__chips">
                    {state.prefs.recentSearches.map((t) => (
                      <button
                        key={t}
                        type="button"
                        className="chip"
                        onClick={() => setQ(t)}
                      >
                        <IconSearch size={14} />
                        <span>{t}</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              <section className="searchov__sec">
                <h3 className="searchov__h">
                  <IconSpark size={15} /> Popular right now
                </h3>
                <ul className="searchov__list">
                  {POPULAR.map((id) => {
                    const p = PRODUCTS.find((x) => x.id === id);
                    if (!p) return null;
                    return (
                      <li key={id}>
                        <SuggestRow p={p} onPick={() => commit(`/p/${p.slug}`, p.name)} />
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section className="searchov__sec">
                <h3 className="searchov__h">Categories</h3>
                <div className="searchov__cats">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="catchip"
                      onClick={() => commit(`/shop?c=${c.id}`, c.name)}
                      style={{ ["--chip-hue" as string]: String(c.hue) }}
                    >
                      <span className="catchip__name">{c.name}</span>
                      <IconChevronRight size={15} />
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* --- Typing ------------------------------------------------------ */}
          {typing && !nothing && (
            <div className="searchov__state" key="typing">
              {cats.length > 0 && (
                <section className="searchov__sec">
                  <h3 className="searchov__h">Categories</h3>
                  <div className="searchov__chips">
                    {cats.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="chip is-selected"
                        onClick={() => commit(`/shop?c=${c.id}`, c.name)}
                      >
                        {c.name}
                        <span className="chip__count num">
                          {PRODUCTS.filter((p) => p.category === c.id).length}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {products.length > 0 && (
                <section className="searchov__sec">
                  <h3 className="searchov__h">
                    {products.length} match{products.length === 1 ? "" : "es"}
                  </h3>
                  <ul className="searchov__list stagger">
                    {products.map((p) => (
                      <li key={p.id}>
                        <SuggestRow
                          p={p}
                          highlight={debounced}
                          onPick={() => commit(`/p/${p.slug}`, debounced)}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <button
                type="button"
                className="searchov__all"
                onClick={() => commit(`/shop?q=${encodeURIComponent(debounced)}`, debounced)}
              >
                See everything for “{debounced}”
                <IconChevronRight size={16} />
              </button>
            </div>
          )}

          {/* --- Nothing found ---------------------------------------------- */}
          {nothing && (
            <div className="searchov__state searchov__nothing">
              <h3 className="searchov__nothingtitle">
                Nothing matches “{debounced}”
              </h3>
              <p className="searchov__nothingbody">
                We may call it something else, or it may not be in season. Try a
                category, or ask us — we source to order for regulars.
              </p>
              <div className="searchov__chips">
                {CATEGORIES.slice(0, 4).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="chip"
                    onClick={() => commit(`/shop?c=${c.id}`, c.name)}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

/** A single suggestion: image, name, category, price. Nothing more. */
function SuggestRow({
  p,
  onPick,
  highlight,
}: {
  p: Product;
  onPick: () => void;
  highlight?: string;
}) {
  const cat = categoryOf(p.category);
  const avail = availabilityLabel(p);
  return (
    <button type="button" className="srow" onClick={onPick}>
      <span className="srow__art">
        <ProductArt hue={p.hue} motif={p.motif} variant="thumb" />
      </span>
      <span className="srow__text">
        <span className="srow__name">{mark(p.name, highlight)}</span>
        <span className="srow__meta">
          {cat?.name}
          <span className="srow__dot" aria-hidden="true">
            ·
          </span>
          <Badge tone={avail.tone} size="sm">
            {avail.text}
          </Badge>
        </span>
      </span>
      <span className="srow__price num">
        {money(p.pricePerKg)}
        <span className="srow__unit">/kg</span>
      </span>
    </button>
  );
}

/** Highlights the typed fragment inside a suggestion's name. */
function mark(text: string, term?: string): React.ReactNode {
  if (!term) return text;
  const i = text.toLowerCase().indexOf(term.trim().toLowerCase());
  if (i < 0) return text;
  const len = term.trim().length;
  return (
    <>
      {text.slice(0, i)}
      <mark className="srow__mark">{text.slice(i, i + len)}</mark>
      {text.slice(i + len)}
    </>
  );
}
