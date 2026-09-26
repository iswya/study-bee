import { notFound, redirect } from "next/navigation";
import { Flashcards } from "@/components/flashcards";
import { getSet } from "@/lib/data";

export default async function FlashcardsPage({ params }: PageProps<"/sets/[id]/flashcards">) {
  const { id } = await params;
  const set = await getSet(id);
  if (!set) notFound();
  if (set.cards.length === 0 || !set.isMine) redirect(`/sets/${id}`);

  return <Flashcards setId={set.id} title={set.title} cards={set.cards} />;
}
