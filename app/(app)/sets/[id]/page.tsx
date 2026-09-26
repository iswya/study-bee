import { ArrowLeftIcon, CardsThreeIcon, ExamIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LearningPath } from "@/components/learning-path";
import { Item, ProgressBar, Stagger } from "@/components/motion";
import { SectionTitle, Tag } from "@/components/ui";
import { getSet } from "@/lib/data";
import { accentStyles, formatDate } from "@/lib/types";
import { CardManager, DeleteSetButton } from "./set-controls";

export default async function StudySetPage({ params }: PageProps<"/sets/[id]">) {
  const { id } = await params;
  const set = await getSet(id);
  if (!set) notFound();

  const a = accentStyles[set.accent];
  const hasCards = set.cards.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 md:py-10">
      <Stagger>
        <Item className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-950">
            <ArrowLeftIcon size={16} weight="bold" /> Home
          </Link>
          <DeleteSetButton setId={set.id} />
        </Item>

        <Item className="mt-5 flex flex-wrap items-center gap-2">
          {set.subject && <Tag className={`${a.soft} ${a.text}`}>{set.subject}</Tag>}
          <Tag className="text-ink-500">{formatDate(set.createdAt)}</Tag>
        </Item>

        <Item>
          <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{set.title}</h1>
        </Item>

        {hasCards && (
          <Item className="mt-6 max-w-xl rounded-card border border-line bg-surface p-5 shadow-card">
            <div className="mb-3 flex items-baseline justify-between text-sm">
              <span className="font-semibold text-ink-700">
                {set.knownCount} / {set.cardCount} known
              </span>
              <span className="font-display text-xl font-semibold tabular-nums">{set.progress}%</span>
            </div>
            <ProgressBar value={set.progress} />
          </Item>
        )}
      </Stagger>

      <div className={`mt-10 grid gap-10 ${hasCards ? "lg:grid-cols-[1fr_340px]" : ""}`}>
        <div>
          {hasCards && (
            <div className="mb-10">
              <SectionTitle>Study</SectionTitle>
              <Stagger className="grid gap-3 sm:grid-cols-2">
                <Mode href={`/sets/${set.id}/flashcards`} icon={<CardsThreeIcon size={24} weight="duotone" />} tone="bg-honey-50 text-honey-600" title="Flashcards" blurb="Flip and sort what you know" />
                <Mode href={`/sets/${set.id}/quiz`} icon={<ExamIcon size={24} weight="duotone" />} tone="bg-lilac-50 text-lilac-600" title="Quiz" blurb="Multiple choice" />
              </Stagger>
            </div>
          )}

          <div id="cards" className="scroll-mt-8">
            <SectionTitle>Cards · {set.cards.length}</SectionTitle>
            <CardManager setId={set.id} cards={set.cards} />
          </div>
        </div>

        {hasCards && (
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <SectionTitle>Path</SectionTitle>
            <div className="overflow-hidden rounded-card border border-line bg-surface py-4 shadow-card">
              <LearningPath setId={set.id} progress={set.progress} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function Mode({ href, icon, tone, title, blurb }: { href: string; icon: React.ReactNode; tone: string; title: string; blurb: string }) {
  return (
    <Item>
      <Link
        href={href}
        className="group flex items-center gap-4 rounded-card border border-line bg-surface p-4 shadow-card transition duration-300 hover:-translate-y-0.5 hover:border-honey-400/60 hover:shadow-lift active:scale-[0.98]"
      >
        <span className={`grid size-12 shrink-0 place-items-center rounded-2xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${tone}`}>
          {icon}
        </span>
        <span>
          <span className="block font-display text-lg font-semibold">{title}</span>
          <span className="block text-sm text-ink-500">{blurb}</span>
        </span>
      </Link>
    </Item>
  );
}
