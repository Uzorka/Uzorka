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

Requires Node 20+. To exercise the AI proxy locally, run `vercel dev` (see below)
instead of `npm run dev`.

## Deploy to Vercel

The app is static files (the SPA + the KJV JSON) plus one serverless function
(`api/complete.js`). Vercel serves both.

1. In Vercel, **Add New → Project** and import this GitHub repo. The included
   `vercel.json` sets the framework (Vite), build command, and output directory
   automatically.
2. **Settings → Environment Variables**: add `ANTHROPIC_API_KEY` (and optionally
   `ANTHROPIC_MODEL`) to enable the AI features. Skip this to ship without AI.
3. **Deploy.** Every push to the connected branch redeploys automatically.

A GitHub Actions workflow (`.github/workflows/ci.yml`) type-checks and builds on
every push and pull request. For other static hosts (e.g. GitHub Pages), the
`dist/` folder is fully static — but the `/api/complete` proxy needs a serverless
platform, so on a pure-static host use the *custom endpoint* AI option below.

## AI configuration (optional)

> **AI is currently turned off.** The app ships with the AI study features
> disabled (`AI_ENABLED = false` in `src/features.ts`), so it needs **no API
> key** — you get whole-Bible reading, the Gospel of John 1's full built-in
> study, audio, bookmarks/notes, and the quiz. To turn AI back on, set
> `AI_ENABLED = true` and configure a provider (below). The client and proxy for
> all providers remain in the codebase.

The **reading-level explanations** (Child / Beginner / Deep) and **Ask about
this verse** features call an AI model — **Anthropic, OpenAI, or Google Gemini**.
When enabled but no backend is reachable, those features show a friendly
"connect an API key" message.

> 💡 **Google Gemini has a free tier** ([aistudio.google.com/apikey](https://aistudio.google.com/apikey)) —
> the easiest way to enable AI without paying. Anthropic and OpenAI are prepaid.

### Recommended: the bundled serverless proxy

The repo ships a Vercel serverless function at `api/complete.js` that calls your
chosen provider so the API key stays server-side (never in the browser). The
client calls `/api/complete` by default — you just set env vars in Vercel
(**Settings → Environment Variables**), then redeploy:

| Provider | Set `AI_PROVIDER` | Key var | Model var (optional, default) |
|---|---|---|---|
| Google Gemini | `gemini` | `GEMINI_API_KEY` | `GEMINI_MODEL` (`gemini-1.5-flash-latest`) |
| Anthropic | `anthropic` | `ANTHROPIC_API_KEY` | `ANTHROPIC_MODEL` (`claude-opus-4-8`) |
| OpenAI | `openai` | `OPENAI_API_KEY` | `OPENAI_MODEL` (`gpt-4o-mini`) |

To run the proxy locally, use the Vercel CLI (`vercel dev`) with the env vars set
— plain `vite dev` serves the static app but not the `/api` function.

### Quick local testing (no proxy)

For your own machine only, put a key in `localStorage` — the client calls the
provider directly (the key stays in your browser):

```js
// In the browser DevTools console, then reload:
localStorage.setItem("be_ai_config", JSON.stringify({ provider: "gemini", apiKey: "YOUR_KEY" }));
// provider: "gemini" | "anthropic" | "openai"; add "model": "…" to override.
```

`setAIConfig()` in `src/ai.ts` does the same. You can also set build-time env in
`.env`: `VITE_AI_PROVIDER`, `VITE_AI_API_KEY`, `VITE_AI_MODEL`, or point at a
fully custom endpoint with `VITE_AI_ENDPOINT` (receives
`{ system, max_tokens, messages, model }`, may reply with a string or any of
`{ text }`, `{ completion }`, `{ output }`, Anthropic `{ content: [{ text }] }`,
or OpenAI `{ choices: [{ message: { content } }] }`).

> ⚠️ `VITE_*` values and `localStorage` keys live in the browser and are visible
> to anyone using that page. For a public site, use the server-side proxy.

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
