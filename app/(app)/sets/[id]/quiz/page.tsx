import { notFound, redirect } from "next/navigation";
import { Quiz } from "@/components/quiz";
import { getSet } from "@/lib/data";

export default async function QuizPage({ params }: PageProps<"/sets/[id]/quiz">) {
  const { id } = await params;
  const set = await getSet(id);
  if (!set) notFound();
  if (set.cards.length === 0 || !set.isMine) redirect(`/sets/${id}`);

  return <Quiz setId={set.id} title={set.title} cards={set.cards} />;
}
