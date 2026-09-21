import { EmptyState } from "../components/Bits";
import { Button } from "../components/Button";
import { ProductCard } from "../components/ProductCard";
import { productById } from "../data/catalog";
import { IconFish, IconHeart } from "../design/icons";
import { useNavigate } from "../lib/router";
import { useStore } from "../state/store";

export function Saved() {
  const { state } = useStore();
  const nav = useNavigate();
  const items = state.favourites
    .map(productById)
    .filter(Boolean) as NonNullable<ReturnType<typeof productById>>[];

  return (
    <div className="page">
      <header className="shophead">
        <p className="kicker">Your list</p>
        <h1 className="shophead__title">Saved seafood</h1>
        {items.length > 0 && (
          <p className="shophead__sub">
            {items.length} saved. We will show you when something here lands fresh.
          </p>
        )}
      </header>

      {items.length === 0 ? (
        <EmptyState
          icon={<IconHeart size={30} />}
          title="Nothing saved yet"
          body="Save seafood you love and quickly find it here later — tap the heart on anything in the shop."
          action={
            <Button
              variant="primary"
              icon={<IconFish size={18} />}
              onClick={() => nav("/shop")}
            >
              Browse seafood
            </Button>
          }
        />
      ) : (
        <div className="pgrid stagger">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} showCategory />
          ))}
        </div>
      )}
    </div>
  );
}
