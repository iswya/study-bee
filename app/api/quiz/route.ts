import { NextResponse, type NextRequest } from "next/server";
import { askClaude } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 300;

const SYSTEM = `You write practice quizzes for a student from their flashcards (and any source notes).

- Test understanding, not just recall: mix direct questions with ones that apply or connect ideas, matched to the requested difficulty.
- Multiple choice: exactly 4 options, one correct. Wrong options must be plausible (same category, similar length) — never silly or obviously wrong. Vary which position holds the right answer.
- True/false: options are exactly ["True", "False"]. Make false statements subtly wrong, not absurd.
- Every question needs a short explanation (1–2 sentences) of why the answer is right.
- "card" is the index of the flashcard the question mainly tests, or -1 if it isn't about one card.
- Only use facts from the cards/notes. Don't repeat the same question. Write in the set's language.`;

const schema = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["multiple_choice", "true_false"] },
          question: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          answer_index: { type: "integer" },
          explanation: { type: "string" },
          card: { type: "integer" },
        },
        required: ["type", "question", "options", "answer_index", "explanation", "card"],
        additionalProperties: false,
      },
    },
  },
  required: ["questions"],
  additionalProperties: false,
};

export type AiQuestion = {
  type: "multiple_choice" | "true_false";
  question: string;
  options: string[];
  answer_index: number;
  explanation: string;
  card: number;
};

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) return fail("Log in first.", 401);

  const body = (await request.json().catch(() => null)) as {
    setId?: string;
    count?: number;
    difficulty?: string;
    types?: string[];
  } | null;
  const count = [5, 10, 20].includes(Number(body?.count)) ? Number(body?.count) : 10;
  const difficulty = ["easy", "medium", "hard"].includes(body?.difficulty ?? "") ? body!.difficulty! : "medium";
  const types = (body?.types ?? []).filter((t) => t === "multiple_choice" || t === "true_false");
  if (!types.length) return fail("Pick at least one question type.");

  const { data: set } = await supabase
    .from("study_sets")
    .select("title, subject, source_text, cards(front, back, position)")
    .eq("id", body?.setId ?? "")
    .eq("user_id", auth.claims.sub)
    .order("position", { referencedTable: "cards" })
    .maybeSingle();
  if (!set) return fail("Set not found.", 404);
  if (!set.cards.length) return fail("Add some cards first.");

  const cards = set.cards.slice(0, 300).map((c, i) => ({ i, front: c.front, back: c.back }));
  const notes = (set.source_text ?? "").slice(0, 30000);
  const typeText = types.length === 2 ? "a mix of multiple choice and true/false" : types[0] === "true_false" ? "true/false only" : "multiple choice only";

  const result = await askClaude<{ questions: AiQuestion[] }>(
    SYSTEM,
    [
      { type: "text", text: `Set: ${set.title}${set.subject ? ` (${set.subject})` : ""}\n\nFlashcards (JSON, "i" is the index):\n${JSON.stringify(cards)}` },
      ...(notes.trim() ? [{ type: "text" as const, text: `Source notes the cards came from:\n\n${notes}` }] : []),
      { type: "text", text: `Write ${count} ${difficulty} questions, ${typeText}.` },
    ],
    schema
  );
  if (!result.ok) return fail(result.error, result.status);

  // Drop anything malformed rather than show a broken question.
  const questions = result.data.questions
    .map((q) => {
      if (q.type !== "true_false") return q;
      // Normalize to [True, False] while keeping the right answer.
      const right = q.options[q.answer_index] ?? "";
      return { ...q, options: ["True", "False"], answer_index: /^\s*true/i.test(right) ? 0 : 1 };
    })
    .filter(
      (q) =>
        q.question?.trim() &&
        q.options.length >= 2 &&
        q.options.length <= 5 &&
        q.options.every((o) => o?.trim()) &&
        Number.isInteger(q.answer_index) &&
        q.answer_index >= 0 &&
        q.answer_index < q.options.length
    )
    .map((q) => ({ ...q, card: Number.isInteger(q.card) && q.card >= 0 && q.card < cards.length ? q.card : -1 }))
    .slice(0, count);
  if (!questions.length) return fail("The AI couldn't write questions for this set. Try again.", 422);

  return NextResponse.json({ questions });
}
