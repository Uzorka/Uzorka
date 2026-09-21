import { useMemo } from "react";
import { Badge, Reveal, Stat } from "../components/Bits";
import { Button } from "../components/Button";
import { ProductArt } from "../components/ProductArt";
import { ProductCard } from "../components/ProductCard";
import { SectionHead } from "../components/Surface";
import { CATEGORIES, PRODUCTS } from "../data/catalog";
import { MEALS } from "../data/meals";
import {
  IconBox,
  IconBowl,
  IconChevronRight,
  IconClock,
  IconFish,
  IconRepeat,
  IconShield,
  IconSnow,
  IconSpark,
  IconVan,
} from "../design/icons";
import { money, plural } from "../lib/format";
import { useNavigate } from "../lib/router";
import { usePreviouslyBought, useStore } from "../state/store";

/**
 * Home.
 *
 * Written for a first-time customer who has never bought seafood online: what is
 * available, what it costs, and the three ways to shop — by item, by box, by
 * meal. A returning customer gets their re-order rail first instead, because for
 * them the fastest path is the one they already took.
 */
export function Home() {
  const nav = useNavigate();
  const { state } = useStore();
  const previous = usePreviouslyBought();
  const returning = state.prefs.returning && previous.length > 0;

  const freshToday = useMemo(
    () =>
      PRODUCTS.filter((p) => p.landedHoursAgo <= 8 && p.availability === "fresh")
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 8),
    []
  );
  const popular = useMemo(
    () => [...PRODUCTS].sort((a, b) => b.popularity - a.popularity).slice(0, 10),
    []
  );

  return (
    <div className="page">
      {/* --- Hero ---------------------------------------------------------- */}
      <section className="hero">
        <div className="hero__art" aria-hidden="true">
          <span className="hero__wave hero__wave--1" />
          <span className="hero__wave hero__wave--2" />
          <span className="hero__wave hero__wave--3" />
        </div>

        <div className="hero__text">
          <Badge tone="glass" size="md">
            <IconSnow size={13} /> Landed this morning in Lagos
          </Badge>
          <h1 className="hero__title">
            Fresh seafood,
            <br />
            <span className="hero__em">ordered simply.</span>
          </h1>
          <p className="hero__body">
            Choose your seafood, tell us the weight and how you want it prepared,
            and pick a delivery day. We clean, cut and chill it — you cook it.
          </p>

          <div className="hero__cta">
            <Button
              variant="primary"
              size="lg"
              icon={<IconFish size={19} />}
              onClick={() => nav("/shop")}
            >
              Shop seafood
            </Button>
            <Button
              variant="secondary"
              size="lg"
              icon={<IconBox size={19} />}
              onClick={() => nav("/box")}
            >
              Build your box
            </Button>
          </div>

          <ul className="hero__trust">
            <li>
              <IconClock size={16} /> Landed today, not last week
            </li>
            <li>
              <IconVan size={16} /> Delivered on a day you choose
            </li>
            <li>
              <IconShield size={16} /> Weighed after preparation
            </li>
          </ul>
        </div>

        {/* A live glance at today's landings. Desktop only — on a phone the
            hero must stay one screen tall and get out of the way. */}
        <aside className="hero__panel glass glass--ink" aria-label="Landed today">
          <p className="hero__panelhead">
            <IconSnow size={14} /> In today
          </p>
          <ul className="hero__panellist">
            {freshToday.slice(0, 4).map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="hero__panelrow"
                  onClick={() => nav(`/p/${p.slug}`)}
                >
                  <span className="hero__panelart">
                    <ProductArt hue={p.hue} motif={p.motif} variant="thumb" />
                  </span>
                  <span className="hero__panelname">{p.name}</span>
                  <span className="hero__panelprice num">
                    {money(p.pricePerKg)}
                    <span>/kg</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="hero__panelfoot">
            Prices are per kilogram of raw weight, before preparation.
          </p>
        </aside>
      </section>

      {/* --- Returning customer: the fastest path first -------------------- */}
      {returning && (
        <Reveal>
          <SectionHead
            kicker="Welcome back"
            title="Order again"
            sub="The seafood you have bought before, ready to add in one tap."
            action={
              <Button
                variant="quiet"
                iconEnd={<IconChevronRight size={16} />}
                onClick={() => nav("/orders")}
              >
                Your orders
              </Button>
            }
          />
          <div className="rail">
            {previous.map((p) => (
              <div key={p.id} className="rail__item">
                <ProductCard product={p} layout="rail" />
              </div>
            ))}
          </div>
        </Reveal>
      )}

      {/* --- Three ways to shop ------------------------------------------- */}
      <Reveal>
        <SectionHead
          kicker="Three ways"
          title={returning ? "Or start somewhere new" : "How would you like to shop?"}
          sub="Pick individual seafood, mix your own box by weight, or start from the meal you want to cook."
        />
        <div className="ways">
          <button type="button" className="way" onClick={() => nav("/shop")}>
            <span className="way__icon">
              <IconFish size={24} />
            </span>
            <span className="way__text">
              <span className="way__title">Shop by seafood</span>
              <span className="way__note">
                {plural(PRODUCTS.length, "item")} across {CATEGORIES.length} categories
              </span>
            </span>
            <IconChevronRight size={18} className="way__chev" />
          </button>

          <button type="button" className="way way--feature" onClick={() => nav("/box")}>
            <span className="way__icon">
              <IconBox size={24} />
            </span>
            <span className="way__text">
              <span className="way__title">
                Build your box
                <Badge tone="brand" size="sm">
                  Signature
                </Badge>
              </span>
              <span className="way__note">Mix anything, pay by weight, one price</span>
            </span>
            <IconChevronRight size={18} className="way__chev" />
          </button>

          <button type="button" className="way" onClick={() => nav("/meals")}>
            <span className="way__icon">
              <IconBowl size={24} />
            </span>
            <span className="way__text">
              <span className="way__title">Shop by meal</span>
              <span className="way__note">Okra, pasta, pepper soup, seafood boil</span>
            </span>
            <IconChevronRight size={18} className="way__chev" />
          </button>
        </div>
      </Reveal>

      {/* --- Categories ---------------------------------------------------- */}
      <Reveal>
        <SectionHead kicker="Browse" title="By category" />
        <div className="rail">
          {CATEGORIES.map((c) => {
            const n = PRODUCTS.filter((p) => p.category === c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                className="ctile"
                onClick={() => nav(`/shop?c=${c.id}`)}
              >
                <span className="ctile__art">
                  <ProductArt hue={c.hue} motif={c.motif} variant="card" />
                </span>
                <span className="ctile__body glass glass--floating">
                  <span className="ctile__name">{c.name}</span>
                  <span className="ctile__count num">{n}</span>
                </span>
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* --- Landed today -------------------------------------------------- */}
      <Reveal>
        <SectionHead
          kicker="Today"
          title="Landed this morning"
          sub="On ice within the hour of coming off the boat."
          action={
            <Button
              variant="quiet"
              iconEnd={<IconChevronRight size={16} />}
              onClick={() => nav("/shop")}
            >
              See all
            </Button>
          }
        />
        <div className="rail">
          {freshToday.map((p) => (
            <div key={p.id} className="rail__item">
              <ProductCard product={p} layout="rail" />
            </div>
          ))}
        </div>
      </Reveal>

      {/* --- Meals --------------------------------------------------------- */}
      <Reveal>
        <SectionHead
          kicker="Start from dinner"
          title="Shop by meal"
          sub="We work out the shopping list — weights, preparations and all. Change anything you like."
          action={
            <Button
              variant="quiet"
              iconEnd={<IconChevronRight size={16} />}
              onClick={() => nav("/meals")}
            >
              All meals
            </Button>
          }
        />
        <div className="mealrail rail">
          {MEALS.slice(0, 4).map((m) => (
            <button
              key={m.id}
              type="button"
              className="mealtile"
              onClick={() => nav(`/meals/${m.slug}`)}
            >
              <span className="mealtile__art">
                <ProductArt hue={m.hue} motif={m.motif} variant="card" />
              </span>
              <span className="mealtile__over glass glass--ink">
                <span className="mealtile__name">{m.name}</span>
                <span className="mealtile__meta num">
                  Serves {m.serves} · {m.minutes} min
                </span>
              </span>
            </button>
          ))}
        </div>
      </Reveal>

      {/* --- Popular ------------------------------------------------------- */}
      <Reveal>
        <SectionHead
          kicker="Most ordered"
          title="What Lagos is buying"
          action={
            <Button
              variant="quiet"
              iconEnd={<IconChevronRight size={16} />}
              onClick={() => nav("/shop?s=popular")}
            >
              See all
            </Button>
          }
        />
        <div className="pgrid">
          {popular.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} showCategory />
          ))}
        </div>
      </Reveal>

      {/* --- Fresh Promise ------------------------------------------------- */}
      <Reveal>
        <section className="promo card card--e2 card--pad-lg">
          <div className="promo__text">
            <p className="kicker">Fresh Promise</p>
            <h2 className="promo__title">
              If it is not right, we make it right.
            </h2>
            <p className="promo__body">
              Every item is checked for smell, firmness and colour before it is
              packed. If anything arrives below standard, tell us within 24 hours
              and we replace it or refund it. No forms, no arguing.
            </p>
            <Button
              variant="secondary"
              icon={<IconShield size={18} />}
              onClick={() => nav("/promise")}
            >
              How we keep it fresh
            </Button>
          </div>
          <div className="promo__stats">
            <Stat
              label="Cold chain"
              value="0–4°C"
              sub="Boat to your door"
              icon={<IconSnow size={15} />}
              tone="brand"
            />
            <Stat
              label="Checked"
              value="Every item"
              sub="Before packing"
              icon={<IconSpark size={15} />}
            />
            <Stat
              label="Replaced"
              value="24 hrs"
              sub="If below standard"
              icon={<IconRepeat size={15} />}
            />
          </div>
        </section>
      </Reveal>

      {/* --- Footer -------------------------------------------------------- */}
      <footer className="foot">
        <div className="foot__cols">
          <div>
            <h3 className="foot__h">Shop</h3>
            <ul className="foot__list">
              {CATEGORIES.slice(0, 4).map((c) => (
                <li key={c.id}>
                  <a href={`#/shop?c=${c.id}`}>{c.name}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="foot__h">Ways to buy</h3>
            <ul className="foot__list">
              <li>
                <a href="#/box">Build Your Box</a>
              </li>
              <li>
                <a href="#/meals">Shop by Meal</a>
              </li>
              <li>
                <a href="#/orders">Order again</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="foot__h">ONEESTORE</h3>
            <ul className="foot__list">
              <li>
                <a href="#/promise">Fresh Promise</a>
              </li>
              <li>
                <a href="#/account">Your account</a>
              </li>
              <li>
                <a href="#/admin">Staff view</a>
              </li>
            </ul>
          </div>
        </div>
        <p className="foot__note">
          Delivering across Lagos. Prices are per kilogram of raw weight and shown
          in naira. Free delivery over {money(60000)}.
        </p>
      </footer>
    </div>
  );
}
