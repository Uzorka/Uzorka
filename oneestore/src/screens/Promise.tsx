import { Reveal, Stat } from "../components/Bits";
import { Button } from "../components/Button";
import { SectionHead } from "../components/Surface";
import {
  IconCheck,
  IconFish,
  IconKnife,
  IconScale,
  IconShield,
  IconSnow,
  IconVan,
} from "../design/icons";
import { useNavigate } from "../lib/router";

/**
 * Fresh Promise — the trust page. It answers the question a first-time customer
 * is actually asking: why should I buy seafood from a website?
 */
const STEPS = [
  {
    icon: IconFish,
    title: "Landed, not stored",
    body: "We buy off the boats at Epe, Badagry and the Lekki rocks each morning. What did not land today is not sold today.",
  },
  {
    icon: IconSnow,
    title: "On ice within the hour",
    body: "Everything goes into the cold chain at the quayside and stays between 0 and 4°C until it reaches your door.",
  },
  {
    icon: IconCheck,
    title: "Checked, item by item",
    body: "Smell, firmness, clarity of the eye, colour of the gill. Anything that fails goes back — it never reaches a box.",
  },
  {
    icon: IconKnife,
    title: "Prepared the morning of delivery",
    body: "Cleaning, filleting and portioning happen on your delivery day, not the night before. Cut fish loses quality fast.",
  },
  {
    icon: IconScale,
    title: "Weighed after preparation",
    body: "You are charged on raw weight, and we show the prepared estimate before you buy. If the final weight comes in short, the difference is refunded automatically.",
  },
  {
    icon: IconVan,
    title: "Sealed and iced for the journey",
    body: "Vacuum sealing where you asked for it, ice packs as standard, and a two- or three-hour delivery window so it is not sitting at a gate.",
  },
];

export function Promise() {
  const nav = useNavigate();

  return (
    <div className="page">
      <section className="phero">
        <div className="phero__text">
          <p className="kicker">Fresh Promise</p>
          <h1 className="phero__title">
            If it is not right,
            <br />
            we make it right.
          </h1>
          <p className="phero__body">
            Buying seafood you cannot smell or press takes trust. Here is exactly
            what we do to earn it — and what happens when we get it wrong.
          </p>
        </div>
        <div className="phero__stats">
          <Stat label="Cold chain" value="0–4°C" sub="Quayside to your door" tone="brand" />
          <Stat label="Checked" value="Every item" sub="Before it is packed" />
          <Stat label="Replaced" value="24 hrs" sub="No forms, no arguing" tone="ok" />
        </div>
      </section>

      <SectionHead
        kicker="How it works"
        title="From the boat to your kitchen"
        sub="Six steps, every order, no exceptions."
      />

      <ol className="psteps">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <Reveal key={s.title} delay={i * 50}>
              <li className="pstep card card--e1 card--pad-lg">
                <span className="pstep__n num">{String(i + 1).padStart(2, "0")}</span>
                <span className="pstep__icon">
                  <Icon size={22} />
                </span>
                <h3 className="pstep__title">{s.title}</h3>
                <p className="pstep__body">{s.body}</p>
              </li>
            </Reveal>
          );
        })}
      </ol>

      <Reveal>
        <section className="pguarantee card card--e2 card--pad-lg">
          <IconShield size={30} />
          <h2 className="pguarantee__title">The promise itself</h2>
          <p className="pguarantee__body">
            If anything in your order arrives below standard, tell us within 24
            hours of delivery. We replace it on your next delivery or refund it,
            whichever you prefer. You do not need a photo, a receipt, or a reason
            we find convincing. Our judgement of freshness failed, not yours.
          </p>
          <div className="pguarantee__actions">
            <Button variant="primary" size="lg" onClick={() => nav("/shop")}>
              Start shopping
            </Button>
            <Button variant="quiet" size="lg" onClick={() => nav("/box")}>
              Build a box instead
            </Button>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
