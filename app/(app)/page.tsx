import { Clock, Flame, Layers, Play, Sparkles } from "lucide-react";
import Link from "next/link";
import { AnimatedNumber, Item, Stagger } from "@/components/motion";
import { NewSetCard, SetCard } from "@/components/set-card";
import { buttonClass, SectionTitle, Tag } from "@/components/ui";
import { studySets } from "@/lib/demo-data";
import { FloatingCards } from "./floating-cards";

export default function Dashboard() {
  // Suggest the set that's started but furthest from done.
  const upNext =
    studySets
      .filter((s) => s.cards.length > 0 && s.progress < 100)
      .sort((a, b) => b.progress - a.progress)[0] ?? studySets[0];
  const cardsLearned = studySets.reduce(
    (n, s) => n + Math.round((s.cards.length * s.progress) / 100),
    0
  );
  const minutes = studySets.reduce((n, s) => n + s.minutesStudied, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 md:py-10">
      <Stagger>
        <Item className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-ink-500">Hey there 👋</p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Let&apos;s get some studying in.
            </h1>
          </div>
          <Tag className="border border-honey-200 bg-honey-50 py-1.5 text-honey-700">
            <Flame className="size-3.5" /> 3-day streak
          </Tag>
        </Item>

        {/* Up next */}
        <Item className="mt-8">
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-600 via-brand-600 to-brand-800 p-6 text-white shadow-brand sm:p-8">
            <div className="honeycomb pointer-events-none absolute inset-0" />
            <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-honey-400/20 blur-3xl" />
            <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <div>
                <Tag className="bg-white/15 text-white backdrop-blur">
                  <Sparkles className="size-3.5" /> Up next
                </Tag>
                <h2 className="mt-4 max-w-md font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                  {upNext.title}
                </h2>
                <p className="mt-2 max-w-md text-sm text-white/75">
                  You&apos;ve got {upNext.progress}% of it down. A quick flashcard round should
                  lock in the rest.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={`/sets/${upNext.id}/flashcards`} className={buttonClass("honey")}>
                    <Play className="size-4 fill-current" /> Keep going
                  </Link>
                  <Link
                    href={`/sets/${upNext.id}`}
                    className={buttonClass("ghost", "text-white hover:bg-white/10")}
                  >
                    View set
                  </Link>
                </div>
              </div>
              <FloatingCards cards={upNext.cards.slice(0, 3)} />
            </div>
          </div>
        </Item>

        {/* Stats */}
        <Item className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
          <Stat icon={<Layers className="size-4" />} tone="bg-brand-50 text-brand-600" label="Cards learned">
            <AnimatedNumber value={cardsLearned} />
          </Stat>
          <Stat icon={<Clock className="size-4" />} tone="bg-mint-50 text-mint-600" label="Minutes studied">
            <AnimatedNumber value={minutes} />
          </Stat>
          <Stat icon={<Flame className="size-4" />} tone="bg-honey-50 text-honey-600" label="Day streak">
            <AnimatedNumber value={3} />
          </Stat>
        </Item>
      </Stagger>

      <section className="mt-12">
        <SectionTitle
          action={
            <Link href="/library" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              See all
            </Link>
          }
        >
          Your sets
        </SectionTitle>
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {studySets.slice(0, 5).map((set) => (
            <SetCard key={set.id} set={set} />
          ))}
          <NewSetCard />
        </Stagger>
      </section>
    </div>
  );
}

function Stat({
  icon,
  tone,
  label,
  children,
}: {
  icon: React.ReactNode;
  tone: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
      <span className={`grid size-8 place-items-center rounded-lg ${tone}`}>{icon}</span>
      <p className="mt-4 font-display text-2xl font-bold tabular-nums tracking-tight sm:text-3xl">{children}</p>
      <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">{label}</p>
    </div>
  );
}
