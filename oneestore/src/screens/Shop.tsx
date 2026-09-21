import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  EmptyState,
  LoadingRegion,
  SkeletonProductCard,
} from "../components/Bits";
import { Button, IconButton } from "../components/Button";
import { OptionRow, SegmentedControl } from "../components/Controls";
import { Adaptive } from "../components/Overlays";
import { ProductCard } from "../components/ProductCard";
import { CATEGORIES, PRODUCTS, categoryOf, searchTerms } from "../data/catalog";
import type { Product } from "../data/types";
import {
  IconClose,
  IconFilter,
  IconFish,
  IconGrid,
  IconSearch,
  IconSort,
} from "../design/icons";
import { money, plural } from "../lib/format";
import { useIsMobile } from "../lib/hooks";
import { navigate, useNavigate, useRoute } from "../lib/router";
import { useStore } from "../state/store";

/* ============================================================================
   Sorting and filtering live in the URL, so a filtered view is shareable and
   the Back button undoes a filter rather than leaving the catalogue.
   ========================================================================== */

const SORTS = [
  { id: "popular", label: "Most popular" },
  { id: "fresh", label: "Landed most recently" },
  { id: "price-low", label: "Price: low to high" },
  { id: "price-high", label: "Price: high to low" },
  { id: "name", label: "Name A–Z" },
] as const;
type SortId = (typeof SORTS)[number]["id"];

const AVAIL_FILTERS = [
  { id: "today", label: "Landed today" },
  { id: "instock", label: "Available now" },
  { id: "preorder", label: "Pre-order" },
] as const;
type AvailId = (typeof AVAIL_FILTERS)[number]["id"];

export function Shop() {
  const route = useRoute();
  const nav = useNavigate();
  const isMobile = useIsMobile();
  const { openOverlay, overlay, closeOverlay } = useStore();

  const cat = route.query.get("c") ?? "";
  const q = route.query.get("q") ?? "";
  const sort = (route.query.get("s") as SortId) ?? "popular";
  const avail = (route.query.get("a") as AvailId) ?? "";
  const maxPrice = Number(route.query.get("max") ?? 0);
  const [view, setView] = useState<"grid" | "list">("grid");

  // A short skeleton pass on every filter change. It is honest about the work
  // and, more importantly, it holds the layout so nothing jumps.
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 260);
    return () => window.clearTimeout(t);
  }, [cat, q, sort, avail, maxPrice]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(route.query);
    if (value) next.set(key, value);
    else next.delete(key);
    const s = next.toString();
    navigate(`/shop${s ? `?${s}` : ""}`, { replace: true });
  };

  const results = useMemo(() => {
    let list: Product[] = [...PRODUCTS];
    if (cat) list = list.filter((p) => p.category === cat);
    if (q) {
      const term = q.toLowerCase();
      list = list.filter((p) => searchTerms(p).includes(term));
    }
    if (avail === "today") list = list.filter((p) => p.landedHoursAgo <= 8);
    if (avail === "instock")
      list = list.filter((p) => p.availability === "fresh" || p.availability === "limited");
    if (avail === "preorder") list = list.filter((p) => p.availability === "preorder");
    if (maxPrice) list = list.filter((p) => p.pricePerKg <= maxPrice);

    switch (sort) {
      case "fresh":
        list.sort((a, b) => a.landedHoursAgo - b.landedHoursAgo);
        break;
      case "price-low":
        list.sort((a, b) => a.pricePerKg - b.pricePerKg);
        break;
      case "price-high":
        list.sort((a, b) => b.pricePerKg - a.pricePerKg);
        break;
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        list.sort((a, b) => b.popularity - a.popularity);
    }
    return list;
  }, [cat, q, sort, avail, maxPrice]);

  const activeCat = cat ? categoryOf(cat) : undefined;
  const filterCount = [avail, maxPrice ? "max" : ""].filter(Boolean).length;
  const sortLabel = SORTS.find((s) => s.id === sort)?.label ?? "Most popular";

  return (
    <div className="page">
      <header className="shophead">
        <div className="shophead__text">
          <p className="kicker">{activeCat ? "Category" : "Catalogue"}</p>
          <h1 className="shophead__title">
            {q ? `“${q}”` : (activeCat?.name ?? "All seafood")}
          </h1>
          <p className="shophead__sub">
            {activeCat?.blurb ??
              "Everything we have today, priced by the kilogram. Choose how it is prepared when you add it."}
          </p>
        </div>
      </header>

      {/* --- Category rail: horizontal on every size, because six categories
              never need to become a wall of chips. ------------------------- */}
      <div className="rail shop__cats">
        <button
          type="button"
          className={`chip ${!cat ? "is-selected" : ""}`}
          onClick={() => setParam("c", "")}
        >
          All
          <span className="chip__count num">{PRODUCTS.length}</span>
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`chip ${cat === c.id ? "is-selected" : ""}`}
            onClick={() => setParam("c", cat === c.id ? "" : c.id)}
          >
            {c.name}
            <span className="chip__count num">
              {PRODUCTS.filter((p) => p.category === c.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* --- Toolbar: sticky, on glass, so filters stay reachable in a long
              catalogue without eating vertical space. ---------------------- */}
      <div className="shopbar glass glass--floating">
        <p className="shopbar__count" role="status">
          {loading ? "Loading…" : plural(results.length, "item")}
        </p>

        <div className="shopbar__actions">
          <button
            type="button"
            className={`shopbar__btn ${filterCount ? "is-on" : ""}`}
            onClick={() => openOverlay({ kind: "filters" })}
          >
            <IconFilter size={17} />
            <span>Filter</span>
            {filterCount > 0 && <span className="shopbar__dot num">{filterCount}</span>}
          </button>

          <button
            type="button"
            className="shopbar__btn"
            onClick={() => openOverlay({ kind: "sort" })}
          >
            <IconSort size={17} />
            <span className="shopbar__sortlabel">{isMobile ? "Sort" : sortLabel}</span>
          </button>

          {!isMobile && (
            <SegmentedControl
              label="Layout"
              size="sm"
              value={view}
              onChange={setView}
              items={[
                { value: "grid", label: "Grid", icon: <IconGrid size={14} /> },
                { value: "list", label: "List", icon: <IconSort size={14} /> },
              ]}
            />
          )}
        </div>
      </div>

      {/* --- Active filter summary, each one removable --------------------- */}
      {(q || avail || maxPrice > 0) && (
        <div className="shop__active">
          {q && (
            <button type="button" className="fpill" onClick={() => setParam("q", "")}>
              <IconSearch size={13} /> “{q}” <IconClose size={13} />
            </button>
          )}
          {avail && (
            <button type="button" className="fpill" onClick={() => setParam("a", "")}>
              {AVAIL_FILTERS.find((a) => a.id === avail)?.label} <IconClose size={13} />
            </button>
          )}
          {maxPrice > 0 && (
            <button type="button" className="fpill" onClick={() => setParam("max", "")}>
              Under {money(maxPrice)} <IconClose size={13} />
            </button>
          )}
        </div>
      )}

      {/* --- Results ------------------------------------------------------- */}
      {loading ? (
        <>
          <LoadingRegion label="Loading seafood" />
          <div className="pgrid">
            {Array.from({ length: 8 }, (_, i) => (
              <SkeletonProductCard key={i} />
            ))}
          </div>
        </>
      ) : results.length === 0 ? (
        <EmptyState
          icon={<IconFish size={30} />}
          title="Nothing matches those filters"
          body="Try widening the price, or clear the filters and browse what came in today."
          action={
            <Button variant="primary" onClick={() => nav("/shop")}>
              Clear filters
            </Button>
          }
          secondary={
            <Button variant="quiet" onClick={() => openOverlay({ kind: "search" })}>
              Search instead
            </Button>
          }
        />
      ) : view === "list" && !isMobile ? (
        <div className="plist">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} layout="row" showCategory />
          ))}
        </div>
      ) : (
        <div className="pgrid stagger">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} showCategory />
          ))}
        </div>
      )}

      {/* --- Filter sheet / dialog ----------------------------------------- */}
      <Adaptive
        open={overlay.kind === "filters"}
        onClose={closeOverlay}
        title="Filter"
        width={440}
        footer={
          <div className="row" style={{ gap: "var(--s-2)" }}>
            <Button
              variant="quiet"
              block
              onClick={() => {
                navigate(`/shop${cat ? `?c=${cat}` : ""}`, { replace: true });
              }}
            >
              Clear all
            </Button>
            <Button variant="primary" block onClick={closeOverlay}>
              Show {results.length} item{results.length === 1 ? "" : "s"}
            </Button>
          </div>
        }
      >
        <section className="fsec">
          <h3 className="fsec__h">Availability</h3>
          {AVAIL_FILTERS.map((a) => (
            <OptionRow
              key={a.id}
              kind="radio"
              name="availability"
              checked={avail === a.id}
              onChange={() => setParam("a", avail === a.id ? "" : a.id)}
              title={a.label}
              note={
                a.id === "today"
                  ? "Off the boat within the last eight hours"
                  : a.id === "preorder"
                    ? "Seasonal items, delivered on the next landing"
                    : "In stock for your chosen delivery day"
              }
            />
          ))}
        </section>

        <section className="fsec">
          <h3 className="fsec__h">Price per kilogram</h3>
          {[8000, 12000, 20000].map((max) => (
            <OptionRow
              key={max}
              kind="radio"
              name="maxprice"
              checked={maxPrice === max}
              onChange={() => setParam("max", maxPrice === max ? "" : String(max))}
              title={`Under ${money(max)}`}
              trailing={
                <Badge tone="neutral" size="sm">
                  {PRODUCTS.filter(
                    (p) => p.pricePerKg <= max && (!cat || p.category === cat)
                  ).length}
                </Badge>
              }
            />
          ))}
        </section>

        <section className="fsec">
          <h3 className="fsec__h">Category</h3>
          <OptionRow
            kind="radio"
            name="cat"
            checked={!cat}
            onChange={() => setParam("c", "")}
            title="All seafood"
          />
          {CATEGORIES.map((c) => (
            <OptionRow
              key={c.id}
              kind="radio"
              name="cat"
              checked={cat === c.id}
              onChange={() => setParam("c", c.id)}
              title={c.name}
              note={c.blurb}
            />
          ))}
        </section>
      </Adaptive>

      {/* --- Sort sheet ----------------------------------------------------- */}
      <Adaptive
        open={overlay.kind === "sort"}
        onClose={closeOverlay}
        title="Sort by"
        width={380}
      >
        {SORTS.map((s) => (
          <OptionRow
            key={s.id}
            kind="radio"
            name="sort"
            checked={sort === s.id}
            onChange={() => {
              setParam("s", s.id === "popular" ? "" : s.id);
              closeOverlay();
            }}
            title={s.label}
          />
        ))}
      </Adaptive>

      {/* --- Mobile: a floating filter button in the thumb zone ------------ */}
      {isMobile && results.length > 0 && (
        <div className="shopfab">
          <IconButton
            label="Filter and sort"
            variant="glass"
            size="lg"
            onClick={() => openOverlay({ kind: "filters" })}
          >
            <IconFilter size={21} />
          </IconButton>
        </div>
      )}
    </div>
  );
}
