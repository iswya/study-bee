import Anthropic from "@anthropic-ai/sdk";
import type { BetaContentBlockParam } from "@anthropic-ai/sdk/resources/beta/messages/messages";
import mammoth from "mammoth";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Claude can take a while on big PDFs.
export const maxDuration = 300;

const MAX_BYTES = 4 * 1024 * 1024; // Vercel caps request bodies at ~4.5 MB
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const SYSTEM = `You turn a student's course material (syllabi, notes, slides, worksheets, photos of textbooks or whiteboards) into flashcards for studying.

- Cover the concepts, terms, facts, dates, formulas, and processes the student would be tested on.
- If the material is a syllabus, make cards about the course topics and key ideas it lists. Skip logistics (office hours, grading policy, due dates) unless the student asks for them.
- Front: a short term or a specific question. Back: a direct answer, ideally under 25 words. No "Q:"/"A:" prefixes.
- One idea per card. No duplicates. Write in the material's language.
- If some material is unreadable, use what you can.
- Title: a short name for the set (under 40 characters). Subject: the course subject in one or two words.`;

const schema = {
  type: "object",
  properties: {
    title: { type: "string" },
    subject: { type: "string" },
    cards: {
      type: "array",
      items: {
        type: "object",
        properties: { front: { type: "string" }, back: { type: "string" } },
        required: ["front", "back"],
        additionalProperties: false,
      },
    },
  },
  required: ["title", "subject", "cards"],
  additionalProperties: false,
};

type Generated = { title: string; subject: string; cards: { front: string; back: string }[] };

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function toBlocks(file: File): Promise<BetaContentBlockParam[]> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();

  if (file.type === "application/pdf" || name.endsWith(".pdf")) {
    return [
      { type: "document", title: file.name, source: { type: "base64", media_type: "application/pdf", data: bytes.toString("base64") } },
    ];
  }
  const imageType = IMAGE_TYPES.find((t) => t === file.type);
  if (imageType) {
    return [
      { type: "text", text: `Image: ${file.name}` },
      { type: "image", source: { type: "base64", media_type: imageType, data: bytes.toString("base64") } },
    ];
  }
  if (file.type === DOCX || name.endsWith(".docx")) {
    const { value } = await mammoth.extractRawText({ buffer: bytes });
    return [{ type: "text", text: `Document "${file.name}":\n\n${value}` }];
  }
  if (file.type.startsWith("text/") || /\.(txt|md|csv|tsv)$/.test(name)) {
    return [{ type: "text", text: `File "${file.name}":\n\n${bytes.toString("utf8")}` }];
  }
  throw new Error(`Can't read ${file.name}. Use PDF, Word, images, or text files.`);
}

export async function POST(request: NextRequest) {
  // Only signed-in users can spend AI credits.
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) return fail("Log in first.", 401);

  if (!process.env.ANTHROPIC_API_KEY) return fail("AI isn't set up yet (missing ANTHROPIC_API_KEY).", 500);

  const form = await request.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  const notes = String(form.get("notes") ?? "").trim();
  const focus = String(form.get("focus") ?? "").trim();
  const count = String(form.get("count") ?? "auto");

  if (!files.length && !notes) return fail("Add a file or some notes first.");
  if (files.reduce((n, f) => n + f.size, 0) > MAX_BYTES) return fail("Files are too big (4 MB max total). Try fewer pages or smaller photos.");

  let content: BetaContentBlockParam[];
  try {
    content = (await Promise.all(files.map(toBlocks))).flat();
  } catch (e) {
    return fail((e as Error).message);
  }
  if (notes) content.push({ type: "text", text: `Student's notes:\n\n${notes}` });

  const howMany = count === "auto" ? "as many cards as the material needs (usually 10–40)" : `about ${Number(count) || 20} cards`;
  content.push({
    type: "text",
    text: `Make ${howMany}.${focus ? ` The student asked: ${focus}` : ""}`,
  });

  const client = new Anthropic();
  try {
    const message = await client.beta.messages
      .stream({
        model: "claude-opus-5",
        max_tokens: 32000,
        system: SYSTEM,
        output_config: { effort: "medium", format: { type: "json_schema", schema } },
        // If a safety classifier declines, retry on Anthropic's recommended fallback model.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        messages: [{ role: "user", content }],
      })
      .finalMessage();

    if (message.stop_reason === "refusal") return fail("The AI declined to make cards from this material.", 422);
    if (message.stop_reason === "max_tokens") return fail("That's too much material for one set. Try splitting it up.", 422);

    const text = message.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
    const result = JSON.parse(text) as Generated;
    const cards = result.cards.filter((c) => c.front?.trim() && c.back?.trim()).slice(0, 200);
    if (!cards.length) return fail("Couldn't find anything to make cards from.", 422);

    return NextResponse.json({ title: result.title, subject: result.subject, cards });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return fail("The AI is busy. Try again in a minute.", 429);
    if (error instanceof Anthropic.BadRequestError) return fail(`The AI couldn't read that: ${error.message}`, 400);
    if (error instanceof Anthropic.AuthenticationError) return fail("The AI key is invalid.", 500);
    if (error instanceof Anthropic.APIError) return fail(`AI error (${error.status}). Try again.`, 502);
    if (error instanceof SyntaxError) return fail("The AI sent back something unreadable. Try again.", 502);
    throw error;
  }
}
