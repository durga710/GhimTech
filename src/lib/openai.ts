import "server-only";
import OpenAI from "openai";

/**
 * OpenAI client singleton (server-only). Powers the AI Copilot daily brief.
 * Model is configurable via OPENAI_MODEL; defaults to the latest GPT-5 chat
 * model. Returns null if no key is configured so callers can degrade gracefully.
 */
export const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-5-chat-latest";

let client: OpenAI | null = null;

export function getOpenAI(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new OpenAI({ apiKey });
  return client;
}
