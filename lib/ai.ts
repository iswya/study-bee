import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { BetaContentBlockParam } from "@anthropic-ai/sdk/resources/beta/messages/messages";

export type DraftCard = { front: string; back: string };

export const cardsSchema = {
  type: "array",
  items: {
    type: "object",
    properties: { front: { type: "string" }, back: { type: "string" } },
    required: ["front", "back"],
    additionalProperties: false,
  },
};

type Result<T> = { ok: true; data: T } | { ok: false; error: string; status: number };

// One structured-output call to Claude. Returns parsed JSON matching `schema`,
// or a friendly error message + HTTP status.
export async function askClaude<T>(system: string, content: BetaContentBlockParam[], schema: Record<string, unknown>): Promise<Result<T>> {
  if (!process.env.ANTHROPIC_API_KEY) return { ok: false, error: "AI isn't set up yet (missing ANTHROPIC_API_KEY).", status: 500 };

  const client = new Anthropic();
  try {
    const message = await client.beta.messages
      .stream({
        model: "claude-opus-5",
        max_tokens: 32000,
        system,
        output_config: { effort: "medium", format: { type: "json_schema", schema } },
        // If a safety classifier declines, retry on Anthropic's recommended fallback model.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        messages: [{ role: "user", content }],
      })
      .finalMessage();

    if (message.stop_reason === "refusal") return { ok: false, error: "The AI declined this request.", status: 422 };
    if (message.stop_reason === "max_tokens") return { ok: false, error: "That's too much for one go. Try a smaller set or request.", status: 422 };

    const text = message.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
    return { ok: true, data: JSON.parse(text) as T };
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return { ok: false, error: "The AI is busy. Try again in a minute.", status: 429 };
    if (error instanceof Anthropic.BadRequestError) return { ok: false, error: `The AI couldn't read that: ${error.message}`, status: 400 };
    if (error instanceof Anthropic.AuthenticationError) return { ok: false, error: "The AI key is invalid.", status: 500 };
    if (error instanceof Anthropic.APIError) return { ok: false, error: `AI error (${error.status}). Try again.`, status: 502 };
    if (error instanceof SyntaxError) return { ok: false, error: "The AI sent back something unreadable. Try again.", status: 502 };
    throw error;
  }
}

export function cleanCards(cards: DraftCard[], max = 300) {
  return cards
    .map((c) => ({ front: c.front?.trim() ?? "", back: c.back?.trim() ?? "" }))
    .filter((c) => c.front && c.back)
    .slice(0, max);
}
