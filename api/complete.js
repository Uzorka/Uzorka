// Serverless AI proxy (Vercel Node function) for Bible Explained.
//
// Keeps the Anthropic API key server-side: the browser POSTs { system,
// max_tokens, messages } to /api/complete and this function forwards it to
// Anthropic, returning { text }. Set ANTHROPIC_API_KEY in the deploy env to
// enable it; without a key it replies 503 { error: "not_configured" } and the
// client shows a friendly "connect an API key" message.
//
// Model defaults to claude-opus-4-8; override with ANTHROPIC_MODEL (e.g.
// claude-haiku-4-5 for a cheaper, faster option).
import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    // No key configured on the server — the client maps this to its
    // "AI isn't configured yet" message.
    res.status(503).json({ error: "not_configured" });
    return;
  }

  const body = req.body || {};
  const { system, max_tokens, messages } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "bad_request" });
    return;
  }

  try {
    const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the env
    const message = await client.messages.create({
      // The model is fixed server-side so a caller can't request an
      // arbitrary (expensive) model through the public endpoint.
      model: MODEL,
      max_tokens: Math.min(Math.max(Number(max_tokens) || 400, 1), 1024),
      system: typeof system === "string" ? system : undefined,
      messages: messages.slice(0, 20).map((m) => ({
        role: m && m.role === "assistant" ? "assistant" : "user",
        content: String((m && m.content) ?? ""),
      })),
    });
    const text = (message.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    res.status(200).json({ text });
  } catch (e) {
    console.error("[/api/complete] upstream error:", e);
    res.status(502).json({ error: "upstream", detail: String((e && e.message) || e).slice(0, 300) });
  }
}
