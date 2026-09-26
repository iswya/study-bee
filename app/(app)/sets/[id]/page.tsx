import { ArrowLeft, CalendarDays, FileText, Layers, ListChecks, Puzzle, Sparkles } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LearningPath } from "@/components/learning-path";
import { Item, ProgressBar, Stagger } from "@/components/motion";
import { buttonClass, SectionTitle, Tag } from "@/components/ui";
import { accentStyles, formatDate, getStudySet, studySets } from "@/lib/demo-data";

export function generateStaticParams() {
  return studySets.map((s) => ({ id: s.id }));
}

export default async function StudySetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const set = getStudySet(id);
  if (!set) notFound();

  const a = accentStyles[set.accent];
  const empty = set.cards.length === 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 md:py-10">
      <Stagger>
        <Item>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">
            <ArrowLeft className="size-4" /> Home
          </Link>
        </Item>

        <Item className="mt-5 flex flex-wrap items-center gap-2">
          <Tag className={`${a.soft} ${a.text}`}>{set.subject}</Tag>
          {set.aiGenerated && (
            <Tag className="bg-brand-50 text-brand-600">
              <Sparkles className="size-3" /> Made with AI
            </Tag>
          )}
          <Tag className="text-ink-500">
            <CalendarDays className="size-3.5" /> {formatDate(set.createdAt)}
          </Tag>
        </Item>

        <Item>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{set.title}</h1>
        </Item>

        <Item className="mt-6 max-w-xl rounded-card border border-line bg-surface p-5 shadow-card">
          <div className="mb-3 flex items-baseline justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="font-display text-lg font-semibold tabular-nums">{set.progress}%</span>
          </div>
          <ProgressBar value={set.progress} className={a.bar} />
        </Item>
      </Stagger>

      {empty ? (
        <EmptyState />
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <SectionTitle>Study it</SectionTitle>
            <Stagger className="grid gap-3 sm:grid-cols-2">
              <Mode href={`/sets/${set.id}/flashcards`} icon={<Layers className="size-5" />} tone="bg-brand-50 text-brand-600" title="Flashcards" blurb="Flip, swipe, repeat." />
              <Mode href={`/sets/${set.id}/quiz`} icon={<ListChecks className="size-5" />} tone="bg-honey-50 text-honey-600" title="Quiz" blurb="Multiple choice, instant feedback." />
              <Mode icon={<Puzzle className="size-5" />} tone="bg-mint-50 text-mint-600" title="Match" blurb="Race to pair them up." soon />
              <Mode icon={<FileText className="size-5" />} tone="bg-sky-50 text-sky-600" title="Practice test" blurb="Mixed questions, graded." soon />
            </Stagger>

            <div className="mt-10">
              <SectionTitle>{set.cards.length} cards</SectionTitle>
              <Stagger className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface shadow-card">
                {set.cards.map((card, i) => (
                  <Item key={card.id} className="grid gap-1 p-4 sm:grid-cols-[2rem_1fr_1fr] sm:gap-4">
                    <span className="text-xs font-semibold tabular-nums text-ink-400 sm:pt-0.5">{i + 1}</span>
                    <p className="font-medium">{card.front}</p>
                    <p className="text-ink-500">{card.back}</p>
                  </Item>
                ))}
              </Stagger>
            </div>
          </div>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <SectionTitle>Your path</SectionTitle>
            <div className="overflow-hidden rounded-card border border-line bg-surface py-4 shadow-card">
              <LearningPath setId={set.id} progress={set.progress} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Mode({
  href,
  icon,
  tone,
  title,
  blurb,
  soon,
}: {
  href?: string;
  icon: React.ReactNode;
  tone: string;
  title: string;
  blurb: string;
  soon?: boolean;
}) {
  const body = (
    <>
      <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${tone}`}>{icon}</span>
      <span className="min-w-0">
        <span className="flex items-center gap-2 font-semibold">
          {title}
          {soon && <Tag className="bg-ink-950/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink-500">Soon</Tag>}
        </span>
        <span className="block text-sm text-ink-500">{blurb}</span>
      </span>
    </>
  );
  const cls =
    "flex items-center gap-4 rounded-card border border-line bg-surface p-4 shadow-card transition duration-300";

  return (
    <Item>
      {href ? (
        <Link href={href} className={`${cls} hover:-translate-y-0.5 hover:border-ink-300 hover:shadow-lift active:scale-[0.98]`}>
          {body}
        </Link>
      ) : (
        <div className={`${cls} opacity-60`}>{body}</div>
      )}
    </Item>
  );
}

function EmptyState() {
  return (
    <Stagger className="mt-10">
      <Item className="mx-auto max-w-md rounded-3xl border border-line bg-surface p-10 text-center shadow-card">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <Layers className="size-7" />
        </div>
        <h2 className="mt-5 font-display text-xl font-semibold tracking-tight">No cards yet</h2>
        <p className="mt-2 text-sm text-ink-500">
          Paste your notes or syllabus and we&apos;ll turn them into cards you can study.
        </p>
        <Link href="/new" className={buttonClass("primary", "mt-6")}>
          <Sparkles className="size-4" /> Add cards
        </Link>
      </Item>
    </Stagger>
  );
}
