import { EmptyState } from "../components/Bits";
import { Button } from "../components/Button";
import { IconFish } from "../design/icons";
import { useNavigate } from "../lib/router";

export function NotFound() {
  const nav = useNavigate();
  return (
    <div className="page">
      <EmptyState
        icon={<IconFish size={30} />}
        title="That page has swum off"
        body="The link may be old, or we may have moved things around. The catalogue is where everything lives."
        action={
          <Button variant="primary" onClick={() => nav("/shop")}>
            Browse seafood
          </Button>
        }
        secondary={
          <Button variant="quiet" onClick={() => nav("/")}>
            Go home
          </Button>
        }
      />
    </div>
  );
}
