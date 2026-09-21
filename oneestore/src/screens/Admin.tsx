import { useMemo, useState } from "react";
import { Badge, EmptyState, ProgressBar, Stat } from "../components/Bits";
import { Button, IconButton } from "../components/Button";
import { SegmentedControl } from "../components/Controls";
import { Adaptive } from "../components/Overlays";
import { SectionHead } from "../components/Surface";
import { PREPS, PRODUCTS, productById } from "../data/catalog";
import { STAGES, zoneById } from "../data/delivery";
import type { Order } from "../data/types";
import {
  IconBox,
  IconCheck,
  IconChat,
  IconFish,
  IconKnife,
  IconPin,
  IconPlus,
  IconSearch,
  IconSpark,
  IconVan,
  IconWarn,
} from "../design/icons";
import { money, stampLabel, timeLabel, weight } from "../lib/format";
import { useIsMobile } from "../lib/hooks";
import { demoOrders, useStore } from "../state/store";

/* ============================================================================
   Operations

   Built to answer five questions in the first screenful, in this order:
   what needs attention, what needs sourcing, what needs preparing, what goes
   out today, and are there customer problems. No decorative charts — every
   number on this page is something a person can act on.

   On a phone the tables become cards rather than shrinking, because a squeezed
   table is unusable in a cold room with one hand.
   ========================================================================== */

type Tab = "today" | "sourcing" | "prep" | "issues" | "catalogue";

export function Admin() {
  const { state, toast } = useStore();
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<Tab>("today");
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");

  // Real orders when the operator has placed some in this session; otherwise a
  // seeded one so the queues are never an empty demo.
  const orders = useMemo<Order[]>(
    () => (state.orders.length > 0 ? state.orders : demoOrders()),
    [state.orders]
  );

  const live = orders.filter((o) => o.stage < STAGES.length - 1);
  const needsSourcing = live.filter((o) => o.stage <= 1);
  const needsPrep = live.filter((o) => o.stage >= 2 && o.stage <= 3);
  const outToday = live.filter((o) => o.stage >= 4);
  const issues = orders.filter((o) => o.issue);

  const lowStock = PRODUCTS.filter(
    (p) => p.availability === "limited" || p.availability === "out"
  );

  // The sourcing list: what to buy at the market, aggregated across orders.
  const sourcingList = useMemo(() => {
    const map = new Map<string, number>();
    needsSourcing.forEach((o) =>
      o.lines.forEach((l) =>
        map.set(l.productId, (map.get(l.productId) ?? 0) + l.grams * l.qty)
      )
    );
    return [...map.entries()]
      .map(([id, g]) => ({ product: productById(id), grams: g }))
      .filter((x) => x.product)
      .sort((a, b) => b.grams - a.grams);
  }, [needsSourcing]);

  const attention = lowStock.length + issues.length;

  const QUICK = [
    { label: "Add product", icon: <IconPlus size={17} /> },
    { label: "Update prices", icon: <IconSpark size={17} /> },
    { label: "Find order", icon: <IconSearch size={17} /> },
    { label: "Create delivery zone", icon: <IconPin size={17} /> },
    { label: "View procurement", icon: <IconFish size={17} /> },
  ];

  const run = (label: string) => {
    setCmdOpen(false);
    toast({
      title: label,
      body: "Demonstration build — this action is not wired to a backend.",
      tone: "info",
    });
  };

  return (
    <div className="page page--wide">
      <header className="adminhead">
        <div>
          <p className="kicker">Operations</p>
          <h1 className="adminhead__title">Today at ONEESTORE</h1>
          <p className="adminhead__sub">
            {new Date().toLocaleDateString("en-NG", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
            {" · "}
            {live.length} live order{live.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button
          variant="secondary"
          icon={<IconSpark size={17} />}
          onClick={() => setCmdOpen(true)}
        >
          Quick actions
        </Button>
      </header>

      {/* --- What needs attention, first and largest --------------------- */}
      <div className="adminstats">
        <Stat
          label="Needs attention"
          value={attention}
          sub={
            attention === 0
              ? "Nothing outstanding"
              : `${lowStock.length} stock, ${issues.length} customer`
          }
          tone={attention > 0 ? "warn" : "ok"}
          icon={<IconWarn size={15} />}
        />
        <Stat
          label="To source"
          value={needsSourcing.length}
          sub={`${weight(sourcingList.reduce((s, x) => s + x.grams, 0))} total`}
          icon={<IconFish size={15} />}
          tone="brand"
        />
        <Stat
          label="To prepare"
          value={needsPrep.length}
          sub="Cleaning and cutting"
          icon={<IconKnife size={15} />}
        />
        <Stat
          label="Out today"
          value={outToday.length}
          sub="Packed or on the road"
          icon={<IconVan size={15} />}
        />
        <Stat
          label="Customer problems"
          value={issues.length}
          sub={issues.length === 0 ? "All clear" : "Needs a call"}
          tone={issues.length > 0 ? "bad" : "ok"}
          icon={<IconChat size={15} />}
        />
      </div>

      <div className="admintabs">
        <SegmentedControl
          label="Operations view"
          block={isMobile}
          value={tab}
          onChange={setTab}
          items={[
            { value: "today", label: "Today" },
            { value: "sourcing", label: "Sourcing" },
            { value: "prep", label: "Prep" },
            { value: "issues", label: "Issues" },
            { value: "catalogue", label: "Stock" },
          ]}
        />
      </div>

      {/* --- Today: every live order ------------------------------------- */}
      {tab === "today" && (
        <section>
          <SectionHead title="Live orders" sub="Newest first. Tap a stage to see the detail." />
          {live.length === 0 ? (
            <EmptyState
              compact
              title="No live orders"
              body="Everything that came in today has been delivered. Enjoy the quiet."
            />
          ) : (
            <ul className="atable">
              {live.map((o) => {
                const zone = zoneById(o.zoneId);
                return (
                  <li key={o.no} className="arow card card--e1 card--pad-md">
                    <div className="arow__main">
                      <div className="arow__id">
                        <p className="arow__no num">{o.no}</p>
                        <p className="arow__cust">{o.contact.name}</p>
                      </div>
                      <div className="arow__where">
                        <p className="arow__zone">
                          <IconPin size={14} /> {zone?.name ?? "Lagos"}
                        </p>
                        <p className="arow__slot num">{o.slotWindow}</p>
                      </div>
                      <div className="arow__stage">
                        <Badge tone="brand" size="sm" dot>
                          {STAGES[o.stage].label}
                        </Badge>
                        <ProgressBar
                          value={((o.stage + 1) / STAGES.length) * 100}
                          height={5}
                          label={`${o.no} progress`}
                        />
                      </div>
                      <p className="arow__total num">{money(o.total)}</p>
                    </div>
                    <ul className="arow__items">
                      {o.lines.map((l) => {
                        const p = productById(l.productId);
                        return (
                          <li key={l.id} className="num">
                            {p?.name} · {weight(l.grams * l.qty)}
                            {l.prep ? ` · ${PREPS[l.prep].label}` : ""}
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* --- Sourcing: the market list ----------------------------------- */}
      {tab === "sourcing" && (
        <section>
          <SectionHead
            title="Buy this morning"
            sub="Aggregated across every order that has not been sourced yet."
          />
          {sourcingList.length === 0 ? (
            <EmptyState compact title="Nothing to source" body="Every live order is already sourced." />
          ) : (
            <ul className="atable">
              {sourcingList.map(({ product, grams }) => (
                <li key={product!.id} className="srcrow card card--e1 card--pad-md">
                  <div className="srcrow__text">
                    <p className="srcrow__name">{product!.name}</p>
                    <p className="srcrow__origin">{product!.origin}</p>
                  </div>
                  <p className="srcrow__qty num">{weight(grams)}</p>
                  <Badge
                    tone={product!.stockKg * 1000 >= grams ? "ok" : "warn"}
                    size="sm"
                  >
                    {product!.stockKg * 1000 >= grams
                      ? "In stock"
                      : `Short ${weight(grams - product!.stockKg * 1000)}`}
                  </Badge>
                  <IconButton label={`Mark ${product!.name} sourced`} variant="soft">
                    <IconCheck size={17} />
                  </IconButton>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* --- Prep: the cutting list -------------------------------------- */}
      {tab === "prep" && (
        <section>
          <SectionHead
            title="Preparation queue"
            sub="Exactly how each customer asked for their seafood to be cut."
          />
          {needsPrep.length === 0 ? (
            <EmptyState compact title="Nothing to prepare" body="The bench is clear." />
          ) : (
            <ul className="atable">
              {needsPrep.flatMap((o) =>
                o.lines.map((l) => {
                  const p = productById(l.productId);
                  if (!p) return null;
                  return (
                    <li key={`${o.no}-${l.id}`} className="preprow card card--e1 card--pad-md">
                      <div className="preprow__head">
                        <span className="preprow__no num">{o.no}</span>
                        <span className="preprow__slot num">{o.slotWindow}</span>
                      </div>
                      <p className="preprow__name">
                        {p.name} <span className="num">· {weight(l.grams * l.qty)}</span>
                      </p>
                      <div className="preprow__spec">
                        <Badge tone="brand" size="sm">
                          <IconKnife size={12} />
                          {l.prep ? PREPS[l.prep].label : "As landed"}
                        </Badge>
                        {l.extras.map((e) => (
                          <Badge key={e} tone="neutral" size="sm">
                            {e.replace(/-/g, " ")}
                          </Badge>
                        ))}
                      </div>
                      <IconButton label="Mark prepared" variant="soft">
                        <IconCheck size={17} />
                      </IconButton>
                    </li>
                  );
                })
              )}
            </ul>
          )}
        </section>
      )}

      {/* --- Issues ------------------------------------------------------- */}
      {tab === "issues" && (
        <section>
          <SectionHead title="Customer problems" sub="Call these back first." />
          {issues.length === 0 ? (
            <EmptyState
              compact
              title="No problems reported"
              body="Nothing has come back from a customer today."
            />
          ) : (
            <ul className="atable">
              {issues.map((o) => (
                <li key={o.no} className="issuerow card card--e2 card--pad-md">
                  <div className="issuerow__top">
                    <Badge tone="bad" size="sm">
                      {o.issue!.kind}
                    </Badge>
                    <span className="num">{o.no}</span>
                    <span className="issuerow__when num">{stampLabel(o.issue!.at)}</span>
                  </div>
                  <p className="issuerow__msg">“{o.issue!.message}”</p>
                  <div className="issuerow__foot">
                    <span className="num">
                      {o.contact.name} · {o.contact.phone}
                    </span>
                    <Button variant="secondary" size="sm">
                      Mark resolved
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* --- Stock -------------------------------------------------------- */}
      {tab === "catalogue" && (
        <section>
          <SectionHead
            title="Stock levels"
            sub="Anything limited or sold out, first."
          />
          <ul className="atable">
            {[...PRODUCTS]
              .sort(
                (a, b) =>
                  Number(b.availability !== "fresh") - Number(a.availability !== "fresh") ||
                  a.stockKg - b.stockKg
              )
              .map((p) => (
                <li key={p.id} className="stockrow card card--e1 card--pad-md">
                  <div className="stockrow__text">
                    <p className="stockrow__name">{p.name}</p>
                    <p className="stockrow__meta num">
                      {money(p.pricePerKg)}/kg · landed {p.landedHoursAgo}h ago
                    </p>
                  </div>
                  <div className="stockrow__bar">
                    <ProgressBar
                      value={Math.min(p.stockKg, 60)}
                      max={60}
                      height={6}
                      tone={p.stockKg < 8 ? "warn" : "ok"}
                      label={`${p.name} stock`}
                    />
                    <span className="stockrow__kg num">{p.stockKg} kg</span>
                  </div>
                  <Badge
                    tone={
                      p.availability === "out"
                        ? "bad"
                        : p.availability === "limited"
                          ? "warn"
                          : p.availability === "preorder"
                            ? "info"
                            : "ok"
                    }
                    size="sm"
                  >
                    {p.availability === "out"
                      ? "Sold out"
                      : p.availability === "limited"
                        ? "Limited"
                        : p.availability === "preorder"
                          ? "Pre-order"
                          : "In stock"}
                  </Badge>
                </li>
              ))}
          </ul>
        </section>
      )}

      {/* --- Quick actions, command style -------------------------------- */}
      <Adaptive
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        title="Quick actions"
        width={460}
      >
        <div className="cmd">
          <div className="cmd__search">
            <IconSearch size={18} />
            <input
              className="cmd__input"
              placeholder="Type an action…"
              value={cmdQuery}
              onChange={(e) => setCmdQuery(e.target.value)}
              aria-label="Search actions"
              data-autofocus
            />
          </div>
          <ul className="cmd__list">
            {QUICK.filter((q) =>
              q.label.toLowerCase().includes(cmdQuery.toLowerCase())
            ).map((q) => (
              <li key={q.label}>
                <button type="button" className="cmd__row" onClick={() => run(q.label)}>
                  <span className="cmd__icon">{q.icon}</span>
                  <span>{q.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Adaptive>

      {/* --- Floating quick-action button on phones ---------------------- */}
      {isMobile && (
        <div className="shopfab">
          <IconButton
            label="Quick actions"
            variant="glass"
            size="lg"
            onClick={() => setCmdOpen(true)}
          >
            <IconBox size={21} />
          </IconButton>
        </div>
      )}

      <p className="adminfoot num">
        Last refreshed {timeLabel(Date.now())} · demonstration data
      </p>
    </div>
  );
}
