// Serverless AI proxy (Vercel Node function) for Bible Explained.
//
// Keeps the provider API key server-side: the browser POSTs { system,
// max_tokens, messages } to /api/complete and this forwards it to the provider
// chosen by AI_PROVIDER (anthropic | openai | gemini), returning { text }.
//
// Env vars:
//   AI_PROVIDER        anthropic (default) | openai | gemini
//   ANTHROPIC_API_KEY / ANTHROPIC_MODEL   (default claude-opus-4-8)
//   OPENAI_API_KEY    / OPENAI_MODEL      (default gpt-4o-mini)
//   GEMINI_API_KEY    / GEMINI_MODEL      (default gemini-1.5-flash-latest)
//
// Without a key for the chosen provider it replies 503 { error: "not_configured" }
// and the client shows a friendly "connect an API key" message.

const PROVIDER = (process.env.AI_PROVIDER || "anthropic").toLowerCase();

const KEYS = {
  anthropic: process.env.ANTHROPIC_API_KEY,
  openai: process.env.OPENAI_API_KEY,
  gemini: process.env.GEMINI_API_KEY,
};
const MODELS = {
  anthropic: process.env.ANTHROPIC_MODEL || "claude-opus-4-8",
  openai: process.env.OPENAI_MODEL || "gpt-4o-mini",
  gemini: process.env.GEMINI_MODEL || "gemini-1.5-flash-latest",
};

async function errText(r) {
  let m = "";
  try {
    const d = await r.json();
    m = (typeof d.error === "object" ? d.error && d.error.message : d.error) || d.message || "";
  } catch {
    /* non-JSON */
  }
  return `upstream ${r.status}${m ? ": " + m : ""}`;
}

async function callAnthropic(key, model, { system, max_tokens, messages }) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model, max_tokens, system, messages }),
  });
  if (!r.ok) throw new Error(await errText(r));
  const d = await r.json();
  return (d.content || []).map((b) => b.text || "").join("");
}

async function callOpenAI(key, model, { system, max_tokens, messages }) {
  const msgs = [...(system ? [{ role: "system", content: system }] : []), ...messages];
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, max_tokens, messages: msgs }),
  });
  if (!r.ok) throw new Error(await errText(r));
  const d = await r.json();
  return (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || "";
}

async function callGemini(key, model, { system, max_tokens, messages }) {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}` +
    `:generateContent?key=${encodeURIComponent(key)}`;
  const body = {
    contents: messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content || "") }],
    })),
    generationConfig: { maxOutputTokens: max_tokens },
  };
  if (system) body.systemInstruction = { parts: [{ text: system }] };
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await errText(r));
  const d = await r.json();
  const parts = d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts;
  return (parts || []).map((x) => x.text || "").join("");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }
  const chosen = PROVIDER in KEYS ? PROVIDER : "anthropic";
  const key = KEYS[chosen];
  if (!key) {
    res.status(503).json({ error: "not_configured" });
    return;
  }

  const body = req.body || {};
  const { system, max_tokens, messages } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "bad_request" });
    return;
  }

  const params = {
    system: typeof system === "string" ? system : undefined,
    max_tokens: Math.min(Math.max(Number(max_tokens) || 400, 1), 1024),
    messages: messages.slice(0, 20).map((m) => ({
      role: m && m.role === "assistant" ? "assistant" : "user",
      content: String((m && m.content) ?? ""),
    })),
  };

  try {
    const fn = chosen === "openai" ? callOpenAI : chosen === "gemini" ? callGemini : callAnthropic;
    const text = await fn(key, MODELS[chosen], params);
    res.status(200).json({ text });
  } catch (e) {
    console.error("[/api/complete] upstream error:", e);
    res.status(502).json({ error: "upstream", detail: String((e && e.message) || e).slice(0, 300) });
  }
}
