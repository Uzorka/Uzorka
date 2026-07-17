// Configurable AI client for the "Explain for a level" and "Ask about this
// verse" features.
//
// The design prototype called a host-provided `window.claude.complete(...)`.
// In a real deployment there is no such host, so this module resolves a
// configurable endpoint instead and degrades gracefully when none is set.
//
// Configuration (first match wins):
//   1. Runtime override in localStorage under `be_ai_config`, a JSON object
//      { endpoint, apiKey?, model? } — lets a user enable AI without a rebuild.
//   2. Build-time env: VITE_AI_ENDPOINT, VITE_AI_API_KEY, VITE_AI_MODEL.
//   3. If a key is present but no endpoint, Anthropic's Messages API is assumed.
//
// See README for setup. When nothing is configured, complete() throws
// AINotConfiguredError and the UI shows a friendly "connect an API key" note.

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type CompleteParams = {
  system: string;
  max_tokens: number;
  messages: ChatMessage[];
};

export type AIConfig = {
  endpoint?: string;
  apiKey?: string;
  model?: string;
};

const ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-3-5-haiku-latest";
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
  return {
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

/** Whether an AI backend is reachable (host bridge or configured endpoint). */
export function isAIConfigured(): boolean {
  if (typeof window !== "undefined" && window.claude?.complete) return true;
  const { endpoint, apiKey } = getAIConfig();
  return Boolean(endpoint || apiKey);
}

/** Pull the assistant text out of the various response shapes we might get. */
function extractText(data: unknown): string {
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    // Anthropic Messages API: { content: [{ type, text }] }
    if (Array.isArray(o.content)) {
      const text = o.content
        .map((b) => (b && typeof b === "object" ? (b as { text?: string }).text ?? "" : ""))
        .join("");
      if (text) return text;
    }
    // Common proxy shapes.
    if (typeof o.completion === "string") return o.completion;
    if (typeof o.text === "string") return o.text;
    if (typeof o.output === "string") return o.output;
    // OpenAI-style: { choices: [{ message: { content } }] }
    if (Array.isArray(o.choices)) {
      const first = o.choices[0] as { message?: { content?: string }; text?: string } | undefined;
      const c = first?.message?.content ?? first?.text;
      if (typeof c === "string") return c;
    }
  }
  return "";
}

/**
 * Run one completion. Prefers a host-provided `window.claude` bridge, then a
 * configured endpoint. Throws AINotConfiguredError when neither is available.
 */
export async function complete(params: CompleteParams): Promise<string> {
  if (typeof window !== "undefined" && window.claude?.complete) {
    return window.claude.complete(params);
  }

  const { apiKey, model } = getAIConfig();
  let { endpoint } = getAIConfig();
  if (!endpoint) {
    if (!apiKey) throw new AINotConfiguredError();
    endpoint = ANTHROPIC_ENDPOINT;
  }

  const isAnthropic = /api\.anthropic\.com/.test(endpoint);
  const headers: Record<string, string> = { "content-type": "application/json" };
  let body: string;

  if (isAnthropic) {
    if (apiKey) headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2023-06-01";
    // Required for calling the API directly from a browser origin.
    headers["anthropic-dangerous-direct-browser-access"] = "true";
    body = JSON.stringify({
      model: model || DEFAULT_MODEL,
      max_tokens: params.max_tokens,
      system: params.system,
      messages: params.messages,
    });
  } else {
    // Generic proxy: pass the whole payload through and let the server decide.
    if (apiKey) headers["authorization"] = `Bearer ${apiKey}`;
    body = JSON.stringify({ ...params, model: model || undefined });
  }

  const res = await fetch(endpoint, { method: "POST", headers, body });
  if (!res.ok) {
    throw new Error(`AI request failed (${res.status})`);
  }
  const data: unknown = await res.json().catch(() => null);
  const text = extractText(data);
  if (!text) throw new Error("AI response was empty");
  return text;
}
