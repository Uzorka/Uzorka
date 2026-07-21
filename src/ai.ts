// Configurable AI client for the "Explain for a level" and "Ask about this
// verse" features. Supports Anthropic, OpenAI, and Google Gemini.
//
// Resolution order (first match wins):
//   1. A host-provided `window.claude.complete(...)` bridge (the design tool).
//   2. An explicit custom `endpoint` — the payload is POSTed as-is (your proxy).
//   3. A client `apiKey` — call the chosen `provider` directly from the browser
//      (handy for local testing; the key lives only in this browser).
//   4. Otherwise the bundled serverless proxy at /api/complete.
//
// Config comes from localStorage `be_ai_config` (a JSON object) or build-time
// VITE_AI_* env vars. When nothing is reachable, complete() throws
// AINotConfiguredError and the UI shows a friendly "connect an API key" note.

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type CompleteParams = {
  system: string;
  max_tokens: number;
  messages: ChatMessage[];
};

export type Provider = "anthropic" | "openai" | "gemini";

export type AIConfig = {
  provider?: Provider;
  endpoint?: string;
  apiKey?: string;
  model?: string;
};

const ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages";
const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
/** The bundled serverless proxy (api/complete.js) — used when nothing else is configured. */
const DEFAULT_PROXY = "/api/complete";

const DEFAULT_MODEL: Record<Provider, string> = {
  anthropic: "claude-opus-4-8",
  openai: "gpt-4o-mini",
  gemini: "gemini-1.5-flash-latest",
};

const STORAGE_KEY = "be_ai_config";

/** A host that injects `window.claude` (e.g. the original design tool). */
type ClaudeHost = { complete: (p: CompleteParams) => Promise<string> };

declare global {
  interface Window {
    claude?: ClaudeHost;
  }
}

export class AINotConfiguredError extends Error {
  constructor() {
    super("AI is not configured");
    this.name = "AINotConfiguredError";
  }
}

export function getAIConfig(): AIConfig {
  let runtime: AIConfig = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) runtime = JSON.parse(raw) as AIConfig;
  } catch {
    /* ignore malformed override */
  }
  const env = import.meta.env;
  const provider = (runtime.provider || env.VITE_AI_PROVIDER || undefined) as Provider | undefined;
  return {
    provider,
    endpoint: runtime.endpoint || env.VITE_AI_ENDPOINT || undefined,
    apiKey: runtime.apiKey || env.VITE_AI_API_KEY || undefined,
    model: runtime.model || env.VITE_AI_MODEL || undefined,
  };
}

/** Persist a runtime AI configuration (used by any future settings UI). */
export function setAIConfig(cfg: AIConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  } catch {
    /* storage unavailable — ignore */
  }
}

/** Whether an AI backend is reachable (host bridge or configured endpoint/key). */
export function isAIConfigured(): boolean {
  if (typeof window !== "undefined" && window.claude?.complete) return true;
  const { endpoint, apiKey } = getAIConfig();
  return Boolean(endpoint || apiKey);
}

/** Pull the assistant text out of the various proxy response shapes. */
function extractText(data: unknown): string {
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.content)) {
      const text = o.content
        .map((b) => (b && typeof b === "object" ? (b as { text?: string }).text ?? "" : ""))
        .join("");
      if (text) return text;
    }
    if (typeof o.completion === "string") return o.completion;
    if (typeof o.text === "string") return o.text;
    if (typeof o.output === "string") return o.output;
    if (Array.isArray(o.choices)) {
      const first = o.choices[0] as { message?: { content?: string }; text?: string } | undefined;
      const c = first?.message?.content ?? first?.text;
      if (typeof c === "string") return c;
    }
  }
  return "";
}

/** Best-effort human-readable message from a provider error response. */
async function readError(res: Response, provider: string): Promise<string> {
  let detail = "";
  try {
    const data = (await res.json()) as {
      error?: { message?: string } | string;
      message?: string;
    };
    detail =
      (typeof data.error === "object" ? data.error?.message : data.error) ||
      data.message ||
      "";
  } catch {
    /* non-JSON body */
  }
  const name = provider.charAt(0).toUpperCase() + provider.slice(1);
  return `${name} error (${res.status})${detail ? ": " + detail : ""}`;
}

// ---- provider-direct calls (browser) ---------------------------------------

async function anthropicDirect(apiKey: string, model: string, p: CompleteParams): Promise<string> {
  const res = await fetch(ANTHROPIC_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model,
      max_tokens: p.max_tokens,
      system: p.system,
      messages: p.messages,
    }),
  });
  if (!res.ok) throw new Error(await readError(res, "anthropic"));
  const data = (await res.json()) as { content?: { type?: string; text?: string }[] };
  return (data.content || []).map((b) => b.text ?? "").join("");
}

async function openaiDirect(apiKey: string, model: string, p: CompleteParams): Promise<string> {
  const messages = [
    ...(p.system ? [{ role: "system" as const, content: p.system }] : []),
    ...p.messages,
  ];
  const res = await fetch(OPENAI_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, max_tokens: p.max_tokens, messages }),
  });
  if (!res.ok) throw new Error(await readError(res, "openai"));
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? "";
}

async function geminiDirect(apiKey: string, model: string, p: CompleteParams): Promise<string> {
  const url = `${GEMINI_BASE}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const body: Record<string, unknown> = {
    contents: p.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    generationConfig: { maxOutputTokens: p.max_tokens },
  };
  if (p.system) body.systemInstruction = { parts: [{ text: p.system }] };
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readError(res, "gemini"));
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return (data.candidates?.[0]?.content?.parts || []).map((x) => x.text ?? "").join("");
}

function callProvider(
  provider: Provider,
  apiKey: string,
  model: string | undefined,
  p: CompleteParams,
): Promise<string> {
  const m = model || DEFAULT_MODEL[provider];
  if (provider === "openai") return openaiDirect(apiKey, m, p);
  if (provider === "gemini") return geminiDirect(apiKey, m, p);
  return anthropicDirect(apiKey, m, p);
}

// ---- generic proxy (bundled /api/complete or a custom endpoint) ------------

async function callProxy(
  endpoint: string,
  apiKey: string | undefined,
  model: string | undefined,
  p: CompleteParams,
  isDefault: boolean,
): Promise<string> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (apiKey) headers["authorization"] = `Bearer ${apiKey}`;
  const body = JSON.stringify({ ...p, model: model || undefined });

  let res: Response;
  try {
    res = await fetch(endpoint, { method: "POST", headers, body });
  } catch (e) {
    if (isDefault) throw new AINotConfiguredError();
    throw e;
  }
  if (!res.ok) {
    if (res.status === 404 || res.status === 501 || res.status === 503) {
      throw new AINotConfiguredError();
    }
    throw new Error(`AI request failed (${res.status})`);
  }
  const data: unknown = await res.json().catch(() => null);
  const text = extractText(data);
  if (!text) throw new Error("AI response was empty");
  return text;
}

/**
 * Run one completion. See the resolution order at the top of this file.
 * Throws AINotConfiguredError when no backend is reachable.
 */
export async function complete(params: CompleteParams): Promise<string> {
  if (typeof window !== "undefined" && window.claude?.complete) {
    return window.claude.complete(params);
  }
  const cfg = getAIConfig();
  // 1. Explicit custom endpoint → pass the payload through.
  if (cfg.endpoint) {
    const text = await callProxy(cfg.endpoint, cfg.apiKey, cfg.model, params, false);
    if (!text) throw new Error("AI response was empty");
    return text;
  }
  // 2. Client key → call the chosen provider directly from the browser.
  if (cfg.apiKey) {
    const text = await callProvider(cfg.provider || "anthropic", cfg.apiKey, cfg.model, params);
    if (!text.trim()) throw new Error("AI response was empty");
    return text;
  }
  // 3. Bundled serverless proxy.
  return callProxy(DEFAULT_PROXY, undefined, undefined, params, true);
}
