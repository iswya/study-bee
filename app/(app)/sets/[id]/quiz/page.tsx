import { notFound, redirect } from "next/navigation";
import { Quiz } from "@/components/quiz";
import { getStudySet, studySets } from "@/lib/demo-data";

export function generateStaticParams() {
  return studySets.map((s) => ({ id: s.id }));
}

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const set = getStudySet(id);
  if (!set) notFound();
  if (set.cards.length === 0) redirect(`/sets/${id}`);

  return <Quiz setId={set.id} title={set.title} cards={set.cards} />;
}
