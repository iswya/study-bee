import { NextResponse, type NextRequest } from "next/server";
import { askClaude, cardsSchema, cleanCards, type DraftCard } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 300;

const SYSTEM = `You edit a student's flashcard set based on their request.

- Apply the request to the cards it's about. Leave every other card exactly as it is, word for word.
- Return the complete set in order, including unchanged cards. Put any new cards where they fit best.
- Keep cards useful for studying: front is a short term or specific question, back is a direct answer.
- Only remove cards if the request asks for it (e.g. "remove duplicates", "drop the easy ones").
- Keep the set's language unless asked to translate.
- Summary: one short sentence saying what you changed, e.g. "Shortened 12 answers and added 3 cards on the Calvin cycle."`;

const schema = {
  type: "object",
  properties: { summary: { type: "string" }, cards: cardsSchema },
  required: ["summary", "cards"],
  additionalProperties: false,
};

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  // Only signed-in users can spend AI credits.
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) return fail("Log in first.", 401);

  const body = (await request.json().catch(() => null)) as {
    cards?: DraftCard[];
    instruction?: string;
    title?: string;
    subject?: string;
  } | null;
  const instruction = body?.instruction?.trim().slice(0, 600) ?? "";
  const cards = cleanCards(body?.cards ?? [], 300);
  if (!instruction) return fail("Say what you'd like changed.");
  if (!cards.length) return fail("There are no cards to change yet.");

  const context = [body?.title && `Set: ${body.title}`, body?.subject && `Subject: ${body.subject}`].filter(Boolean).join("\n");
  const result = await askClaude<{ summary: string; cards: DraftCard[] }>(
    SYSTEM,
    [
      { type: "text", text: `${context ? context + "\n\n" : ""}Current cards (JSON):\n${JSON.stringify(cards)}` },
      { type: "text", text: `The student's request: ${instruction}` },
    ],
    schema
  );
  if (!result.ok) return fail(result.error, result.status);

  const next = cleanCards(result.data.cards, 300);
  if (!next.length) return fail("The AI returned no cards. Try rephrasing.", 422);
  return NextResponse.json({ summary: result.data.summary, cards: next });
}
