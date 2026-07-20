# Bible Explained

Read the Bible and understand every verse — plain-language explanations, audio
narration, historical context, and practical lessons. Study Scripture one verse
at a time. The **complete King James Version** (all 66 books, public domain).

Built with **Vite + React + TypeScript**. Implemented from a Claude Design
handoff prototype, recreated pixel-for-pixel as a real application.

## Features

- **Whole-Bible reader** — all 66 books and 1,189 chapters, browseable and
  searchable, with shareable URLs for every chapter and verse.
- **Guided verse reader** — verse text plus a study panel. The Gospel of John
  chapter 1 ships hand-written study (simple meaning, context, key words, people
  & places, main lesson, application, reflection, related verses); every other
  verse gets a plain-language explanation generated on demand by AI.
- **Reading levels** — Child / Beginner / Standard / Deep re-explanations via a
  configurable AI backend.
- **Ask about this verse** — free-form questions answered by the same backend.
- **Full-chapter reader** with a floating audio player.
- **Audio narration** via the browser's Web Speech API, with speed control,
  auto-advance, and a distraction-free **Listening** mode (with a sleep timer).
- **Library** — bookmarks and personal notes across the whole Bible, plus
  reading progress.
- **Shareable, refresh-safe URLs** — hash routing (e.g. `#/read/john/3/16`) so
  links, the browser Back button, and reloads all work.
- Everything persists to `localStorage`; the layout is fully responsive with a
  mobile tab bar.

## Bible text

The full KJV corpus lives in `public/bible/` as one compact JSON file per book
(`{ id, name, chapters: string[][] }`), loaded lazily so only the books you open
are downloaded. Text is the King James Version, which is in the public domain;
the machine-readable compilation is from
[aruljohn/Bible-kjv](https://github.com/aruljohn/Bible-kjv). To regenerate the
assets, see `scripts/fetch-bible.mjs`.

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check and produce a production build in dist/
npm run preview   # preview the production build
```

## AI configuration (optional)

The **reading-level explanations** and **Ask about this verse** features call an
AI model. Everything else works without any configuration — the built-in
Standard explanations and all study content are always available. When no
backend is configured, those two features show a friendly "connect an API key"
message instead of an answer.

Configuration is resolved in this order (first match wins):

1. **Runtime override** — a JSON object in `localStorage` under `be_ai_config`:
   ```js
   localStorage.setItem(
     "be_ai_config",
     JSON.stringify({ endpoint: "https://your-proxy.example/complete", apiKey: "…", model: "…" }),
   );
   ```
   Lets you enable AI without rebuilding. `setAIConfig()` in `src/ai.ts` does the
   same thing.
2. **Build-time environment variables** (copy `.env.example` to `.env`):
   - `VITE_AI_ENDPOINT` — the URL to POST completions to.
   - `VITE_AI_API_KEY` — optional bearer token / API key.
   - `VITE_AI_MODEL` — optional model id.
3. If an **API key but no endpoint** is set, Anthropic's Messages API is assumed
   (`https://api.anthropic.com/v1/messages`).

### Backend shapes

- **Anthropic-direct** (endpoint on `api.anthropic.com`): the request is sent as
  an Anthropic Messages call, including the
  `anthropic-dangerous-direct-browser-access` header required for browser
  origins. Convenient for local testing; for production prefer a proxy so your
  key is never shipped to the client.
- **Custom proxy** (any other endpoint): the payload
  `{ system, max_tokens, messages, model }` is POSTed with an optional
  `Authorization: Bearer <apiKey>` header. The response may be a plain string or
  any of these shapes: `{ completion }`, `{ text }`, `{ output }`, an Anthropic
  `{ content: [{ text }] }`, or an OpenAI-style `{ choices: [{ message: { content } }] }`.

> ⚠️ Shipping an API key in a client bundle (`VITE_AI_API_KEY`) exposes it to
> anyone who loads the page. Use a server-side proxy for anything public.

## Project structure

```
src/
  data.ts           KJV text + study/quiz/summary seed data (typed)
  theme.ts          design tokens (colors, fonts, shadows)
  ai.ts             configurable AI completion client
  useBibleApp.ts    all app state, navigation, audio, persistence
  App.tsx           screen router + chrome (header, tabs, toast)
  components/       Header, MobileTabs, Toast, Segmented, Modes, Skeleton
  screens/          Home, Books, Chapters, Reader, Chapter, Done, Library, Listen
```

## Note

The study explanations are plain-language study help, not divine authority;
Christians sometimes interpret passages differently. Bible text is the King
James Version, which is in the public domain.
