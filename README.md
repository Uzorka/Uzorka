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

The **reading-level explanations** (Child / Beginner / Deep) and **Ask about
this verse** features call an AI model. Everything else works without any
configuration — the Gospel of John 1 study and all Bible text are always
available. When no backend is reachable, those features show a friendly
"connect an API key" message instead of an answer.

### Recommended: the bundled serverless proxy

The repo ships a Vercel serverless function at `api/complete.js` that proxies
Anthropic so your API key stays server-side (never in the browser). The client
calls `/api/complete` by default — you just add a key:

1. Get an API key at [console.anthropic.com](https://console.anthropic.com/).
2. In your Vercel project → **Settings → Environment Variables**, add
   `ANTHROPIC_API_KEY`. Optionally add `ANTHROPIC_MODEL` (defaults to
   `claude-opus-4-8`; set `claude-haiku-4-5` for a cheaper, faster option).
3. Redeploy. The level tabs and Ask box now work.

To run the proxy locally, use the Vercel CLI (`vercel dev`) with
`ANTHROPIC_API_KEY` in your environment — plain `vite dev` serves the static app
but not the `/api` function, so AI shows the "not configured" message.

### Advanced: custom endpoint (no bundled proxy)

You can instead point the client at your own endpoint, resolved in this order:

1. **Runtime override** — a JSON object in `localStorage` under `be_ai_config`
   (`setAIConfig()` in `src/ai.ts` writes it):
   ```js
   localStorage.setItem("be_ai_config",
     JSON.stringify({ endpoint: "https://your-proxy.example/complete", apiKey: "…", model: "…" }));
   ```
2. **Build-time env** (`.env`): `VITE_AI_ENDPOINT`, `VITE_AI_API_KEY`, `VITE_AI_MODEL`.
3. An **API key with no endpoint** → Anthropic's Messages API directly
   (browser-direct, for local testing only).

A custom endpoint receives `{ system, max_tokens, messages, model }` (plus an
optional `Authorization: Bearer <apiKey>`) and may reply with a plain string or
any of `{ text }`, `{ completion }`, `{ output }`, an Anthropic
`{ content: [{ text }] }`, or an OpenAI-style `{ choices: [{ message: { content } }] }`.

> ⚠️ `VITE_*` values are bundled into the client and visible to anyone. Prefer
> the server-side `/api/complete` proxy for anything public.

## Project structure

```
api/
  complete.js       Vercel serverless proxy to Anthropic (keeps the key server-side)
public/bible/       full KJV corpus, one JSON per book + index.json (lazy-loaded)
scripts/
  fetch-bible.mjs   regenerates public/bible/
src/
  data.ts           John 1 study/quiz/summary seed + verse-of-the-day (typed)
  bible.ts          book manifest, lazy book loader, reference keys
  theme.ts          design tokens (colors, fonts, shadows)
  ai.ts             AI client (defaults to /api/complete; configurable)
  useBibleApp.ts    all app state, navigation, audio, persistence
  App.tsx           hash router + chrome (header, tabs, toast)
  components/       Header, MobileTabs, Toast, Segmented, Modes, Skeleton
  screens/          Home, Books, Chapters, Reader, Chapter, Done, Library, Listen
```

## Note

The study explanations are plain-language study help, not divine authority;
Christians sometimes interpret passages differently. Bible text is the King
James Version, which is in the public domain.
