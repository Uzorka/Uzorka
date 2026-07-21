// Feature flags.

/**
 * AI-powered study features: the Child/Beginner/Deep reading-level tabs and the
 * "Ask about this verse" box. Off for now, so the app needs no API key.
 *
 * To re-enable: set this to `true` and configure a provider (a free Google
 * Gemini key is the easiest — see the README "AI configuration" section). The
 * client + serverless proxy for all providers are still in the codebase
 * (src/ai.ts, api/complete.js); this flag only controls the UI.
 */
export const AI_ENABLED = false;
