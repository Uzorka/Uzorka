import { C } from "../theme";

/** The rounded pill segmented control used for reading modes and study levels. */
export function Segmented({
  items,
  active,
  onPick,
  padding = "7px 13px",
}: {
  items: string[];
  active: string;
  onPick: (item: string) => void;
  padding?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        background: "rgba(22,34,46,.06)",
        borderRadius: 999,
        padding: 3,
      }}
    >
      {items.map((x) => {
        const on = x === active;
        return (
          <button
            key={x}
            onClick={() => onPick(x)}
            style={{
              border: "none",
              background: on ? "#fff" : "transparent",
              color: on ? C.navy : C.muted,
              fontSize: 12,
              fontWeight: 600,
              padding,
              borderRadius: 999,
              whiteSpace: "nowrap",
              cursor: "pointer",
              boxShadow: on ? "0 1px 3px rgba(22,34,46,.15)" : "none",
            }}
          >
            {x}
          </button>
        );
      })}
    </div>
  );
}
