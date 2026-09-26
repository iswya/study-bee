import { notFound, redirect } from "next/navigation";
import { AiQuiz } from "@/components/ai-quiz";
import { getSet } from "@/lib/data";

export default async function AiQuizPage({ params }: PageProps<"/sets/[id]/ai-quiz">) {
  const { id } = await params;
  const set = await getSet(id);
  if (!set) notFound();
  if (set.cards.length === 0 || !set.isMine) redirect(`/sets/${id}`);

  // Card ids in the same order the API numbers them, so answers map back to cards.
  return <AiQuiz setId={set.id} title={set.title} cardIds={set.cards.map((c) => c.id)} />;
}
