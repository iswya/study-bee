import { notFound, redirect } from "next/navigation";
import { Flashcards } from "@/components/flashcards";
import { getStudySet, studySets } from "@/lib/demo-data";

export function generateStaticParams() {
  return studySets.map((s) => ({ id: s.id }));
}

export default async function FlashcardsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const set = getStudySet(id);
  if (!set) notFound();
  if (set.cards.length === 0) redirect(`/sets/${id}`);

  return <Flashcards setId={set.id} title={set.title} cards={set.cards} />;
}
