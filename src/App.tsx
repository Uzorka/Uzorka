import { useBibleApp } from "./useBibleApp";
import { C, SANS } from "./theme";
import { Header } from "./components/Header";
import { MobileTabs } from "./components/MobileTabs";
import { Toast } from "./components/Toast";
import { Home } from "./screens/Home";
import { Books } from "./screens/Books";
import { Chapters } from "./screens/Chapters";
import { Reader } from "./screens/Reader";
import { Chapter } from "./screens/Chapter";
import { Done } from "./screens/Done";
import { Library } from "./screens/Library";
import { Listen } from "./screens/Listen";

export default function App() {
  const app = useBibleApp();
  const { s } = app;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.ink,
        fontFamily: SANS,
        paddingBottom: 120,
      }}
    >
      <Header app={app} />

      {s.screen === "home" && <Home app={app} />}
      {s.screen === "books" && <Books app={app} />}
      {s.screen === "chapters" && <Chapters app={app} />}
      {s.screen === "reader" && <Reader app={app} />}
      {s.screen === "chapter" && <Chapter app={app} />}
      {s.screen === "done" && <Done app={app} />}
      {s.screen === "library" && <Library app={app} />}
      {s.screen === "listen" && <Listen app={app} />}

      <MobileTabs app={app} />
      <Toast app={app} />
    </div>
  );
}
