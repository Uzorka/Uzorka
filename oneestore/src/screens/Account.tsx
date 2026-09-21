import { useState } from "react";
import { Badge, EmptyState, Stat } from "../components/Bits";
import { Button } from "../components/Button";
import { Field, OptionRow, SegmentedControl, Switch } from "../components/Controls";
import { SectionHead } from "../components/Surface";
import { PREPS, productById } from "../data/catalog";
import { ZONES, zoneById } from "../data/delivery";
import {
  IconCheck,
  IconHeart,
  IconPin,
  IconReceipt,
  IconShield,
  IconUser,
} from "../design/icons";
import { formatPhone, money } from "../lib/format";
import { useNavigate } from "../lib/router";
import { useStore } from "../state/store";

/**
 * Account — details, addresses and remembered preferences.
 *
 * The preferences section is the honest face of the personalisation the app
 * does elsewhere: if we are quietly remembering that you always want croaker
 * filleted, you should be able to see it and switch it off.
 */
export function Account() {
  const { state, dispatch, toast } = useStore();
  const nav = useNavigate();

  const [name, setName] = useState(state.prefs.contact?.name ?? "");
  const [phone, setPhone] = useState(state.prefs.contact?.phone ?? "");
  const [email, setEmail] = useState(state.prefs.contact?.email ?? "");
  const [line, setLine] = useState(state.prefs.address?.line ?? "");
  const [zoneId, setZoneId] = useState(state.prefs.address?.zoneId ?? "");
  const [instructions, setInstructions] = useState(
    state.prefs.address?.instructions ?? ""
  );
  const [remember, setRemember] = useState(true);
  const [saved, setSaved] = useState(false);

  const preps = Object.entries(state.prefs.preps);
  const spend = state.orders.reduce((s, o) => s + o.total, 0);

  const save = () => {
    dispatch({
      type: "prefs/patch",
      patch: {
        contact: { name, phone, email },
        address: { line, zoneId, instructions },
      },
    });
    setSaved(true);
    toast({ title: "Details saved", body: "We will fill these in next time.", tone: "ok" });
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="page page--narrow">
      <header className="shophead">
        <p className="kicker">Account</p>
        <h1 className="shophead__title">{name || "Your account"}</h1>
        <p className="shophead__sub">
          Saved here so you never type it twice. Nothing leaves this device in this
          build.
        </p>
      </header>

      {state.orders.length > 0 && (
        <div className="acctstats">
          <Stat
            label="Orders"
            value={state.orders.length}
            icon={<IconReceipt size={15} />}
          />
          <Stat label="Total spent" value={money(spend)} tone="brand" />
          <Stat
            label="Saved items"
            value={state.favourites.length}
            icon={<IconHeart size={15} />}
          />
        </div>
      )}

      <SectionHead title="Your details" />
      <div className="card card--e1 card--pad-lg">
        <Field
          label="Full name"
          value={name}
          onChange={setName}
          autoComplete="name"
          placeholder="Amaka Okafor"
          icon={<IconUser size={18} />}
        />
        <Field
          label="Mobile number"
          value={phone}
          onChange={setPhone}
          format={formatPhone}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0803 123 4567"
        />
        <Field
          label="Email"
          value={email}
          onChange={setEmail}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
      </div>

      <SectionHead
        title="Delivery address"
        sub="We will use this by default at checkout — you can always change it there."
      />
      <div className="card card--e1 card--pad-lg">
        <p className="acct__label">Area</p>
        <div className="acct__zones">
          {ZONES.filter((z) => z.served).map((z) => (
            <button
              key={z.id}
              type="button"
              className={`chip ${zoneId === z.id ? "is-selected" : ""}`}
              onClick={() => setZoneId(z.id)}
            >
              {z.name}
            </button>
          ))}
        </div>
        {zoneId && (
          <p className="acct__zonefee num">
            {money(zoneById(zoneId)?.fee ?? 0)} delivery · cut-off{" "}
            {zoneById(zoneId)?.cutoff}
          </p>
        )}
        <Field
          label="Street address"
          value={line}
          onChange={setLine}
          autoComplete="street-address"
          placeholder="14 Fola Osibo Street"
          icon={<IconPin size={18} />}
        />
        <Field
          label="Directions for the rider"
          value={instructions}
          onChange={setInstructions}
          optional
          multiline
          placeholder="Gate colour, landmark, floor…"
        />
      </div>

      <SectionHead
        title="Remembered preferences"
        sub="How you usually want each item prepared. We suggest these — we never apply them without showing you."
      />
      {preps.length === 0 ? (
        <EmptyState
          compact
          title="Nothing remembered yet"
          body="Once you order a few times, the preparations you pick most often will show up here."
        />
      ) : (
        <div className="card card--e1 card--pad-md">
          <div className="acct__prefrow">
            <div>
              <p className="acct__preflabel">Suggest my usual preparation</p>
              <p className="acct__prefnote">
                Pre-selects the preparation you picked last time. It is always
                visible and always changeable.
              </p>
            </div>
            <Switch
              checked={remember}
              onChange={setRemember}
              label="Suggest my usual preparation"
            />
          </div>
          <ul className="acct__preps">
            {preps.map(([id, prep]) => {
              const p = productById(id);
              if (!p) return null;
              return (
                <li key={id}>
                  <span className="acct__prepname">{p.name}</span>
                  <Badge tone="neutral" size="sm">
                    {PREPS[prep].label}
                  </Badge>
                  <button
                    type="button"
                    className="acct__prepx"
                    onClick={() => {
                      const next = { ...state.prefs.preps };
                      delete next[id];
                      dispatch({ type: "prefs/patch", patch: { preps: next } });
                    }}
                  >
                    Forget
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <SectionHead title="Appearance" />
      <div className="card card--e1 card--pad-md">
        <div className="acct__prefrow">
          <div>
            <p className="acct__preflabel">Theme</p>
            <p className="acct__prefnote">
              Auto follows your device. Dark mode keeps the same contrast — the
              water just gets deeper.
            </p>
          </div>
          <SegmentedControl
            label="Theme"
            size="sm"
            value={state.prefs.theme}
            onChange={(v) => dispatch({ type: "prefs/patch", patch: { theme: v } })}
            items={[
              { value: "system", label: "Auto" },
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
        </div>
      </div>

      <SectionHead title="Other" />
      <div className="card card--e1 card--pad-none">
        <OptionRow
          kind="check"
          checked={false}
          onChange={() => nav("/saved")}
          title="Saved seafood"
          note={`${state.favourites.length} items`}
          icon={<IconHeart size={19} />}
        />
        <OptionRow
          kind="check"
          checked={false}
          onChange={() => nav("/orders")}
          title="Your orders"
          note={`${state.orders.length} orders`}
          icon={<IconReceipt size={19} />}
        />
        <OptionRow
          kind="check"
          checked={false}
          onChange={() => nav("/promise")}
          title="Fresh Promise"
          note="How we keep it fresh, and what happens if we do not"
          icon={<IconShield size={19} />}
        />
      </div>

      <div className="acct__save">
        <Button
          variant="primary"
          size="lg"
          block
          success={saved}
          successLabel="Saved"
          icon={<IconCheck size={18} />}
          onClick={save}
        >
          Save my details
        </Button>
      </div>
    </div>
  );
}
