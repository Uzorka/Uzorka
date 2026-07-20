import type { BibleApp } from "../useBibleApp";
import type { BookMeta } from "../bible";
import { C, SERIF } from "../theme";

const colKicker: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: ".14em",
  color: C.gold,
  marginBottom: 10,
};

function BookRow({ book, onOpen }: { book: BookMeta; onOpen: () => void }) {
  return (
    <button
      className="be-bookrow"
      onClick={onOpen}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "none",
        background: "none",
        cursor: "pointer",
        fontSize: 15,
        padding: "9px 12px",
        borderRadius: 10,
        color: C.ink,
        textAlign: "left",
      }}
    >
      <span>{book.name}</span>
      <span style={{ fontSize: 12, color: C.faint }}>{book.chapters} ch</span>
    </button>
  );
}

export function Books({ app }: { app: BibleApp }) {
  const { s, actions, books } = app;
  const grid2 = s.isMobile ? "1fr" : "1fr 1fr";
  const search = s.bookSearch.trim().toLowerCase();
  const match = (b: BookMeta) => !search || b.name.toLowerCase().includes(search);
  const ot = books.filter((b) => b.testament === "OT" && match(b));
  const nt = books.filter((b) => b.testament === "NT" && match(b));

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "36px 20px 0" }}>
      <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 32, margin: 0 }}>Bible books</h2>
      <input
        className="be-input-plain"
        value={s.bookSearch}
        onChange={(e) => actions.setBookSearch(e.target.value)}
        placeholder="Search books…"
        style={{
          marginTop: 16,
          width: "100%",
          maxWidth: 420,
          border: "1px solid rgba(22,34,46,.14)",
          background: "#fff",
          borderRadius: 12,
          padding: "12px 16px",
          fontSize: 15,
          outline: "none",
          color: C.ink,
        }}
      />
      <div style={{ display: "grid", gridTemplateColumns: grid2, gap: 28, marginTop: 24 }}>
        <div>
          <div style={colKicker}>OLD TESTAMENT</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {ot.map((b) => (
              <BookRow key={b.id} book={b} onOpen={() => actions.openBook(b.id)} />
            ))}
            {ot.length === 0 && <Empty />}
          </div>
        </div>
        <div>
          <div style={colKicker}>NEW TESTAMENT</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {nt.map((b) => (
              <BookRow key={b.id} book={b} onOpen={() => actions.openBook(b.id)} />
            ))}
            {nt.length === 0 && <Empty />}
          </div>
        </div>
      </div>
    </div>
  );
}

function Empty() {
  return <div style={{ fontSize: 14, color: C.faint, padding: "6px 12px" }}>No matches.</div>;
}
