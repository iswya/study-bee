import { ArrowRightIcon, BooksIcon, CardsThreeIcon, CheckCircleIcon, ExamIcon, FireIcon, PlayIcon, PlusIcon, TimerIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { Bee } from "@/components/bee";
import { AnimatedNumber, Item, Stagger } from "@/components/motion";
import { NewSetCard, SetCard } from "@/components/set-card";
import { buttonClass, pressable, SectionTitle } from "@/components/ui";
import { getLeaderboard, getSets, getStats } from "@/lib/data";
import { Avatar } from "@/components/avatar";

export default async function Home() {
  const [sets, stats, board] = await Promise.all([getSets(), getStats(), getLeaderboard("week")]);
  const online = board.filter((r) => r.online && !r.is_me);

  if (sets.length === 0) return <Empty />;

  const known = sets.reduce((n, s) => n + s.knownCount, 0);
  // Continue with the least-finished set that has cards.
  const next = sets
    .filter((s) => s.cardCount > 0 && s.progress < 100)
    .sort((a, b) => a.progress - b.progress)[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 md:py-10">
      <Stagger>
        {online.length > 0 && (
          <Item className="mb-6 flex items-center gap-3 overflow-x-auto pb-1">
            <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-mint-600">
              <span className="size-2 animate-pulse rounded-full bg-mint-500" /> Online now
            </span>
            {online.map((u) => (
              <Link key={u.username} href={`/u/${u.username}`} className={`flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3 text-sm font-semibold hover:border-honey-400/60 ${pressable}`}>
                <Avatar user={u} size="sm" online className="[&>span:first-child]:size-7 [&>span:first-child]:rounded-full [&>span:first-child]:text-base" />
                {u.username}
              </Link>
            ))}
          </Item>
        )}
        <Item className="grid grid-cols-3 gap-3 sm:gap-4">
          <Stat icon={<CheckCircleIcon size={20} weight="duotone" />} tone="bg-mint-50 text-mint-600" label="Cards known">
            <AnimatedNumber value={known} />
          </Stat>
          <Stat icon={<TimerIcon size={20} weight="duotone" />} tone="bg-sky-50 text-sky-600" label="Minutes studied">
            <AnimatedNumber value={stats.minutes} />
          </Stat>
          <Stat icon={<FireIcon size={20} weight="duotone" />} tone="bg-honey-50 text-honey-600" label="Day streak">
            <AnimatedNumber value={stats.streak} />
          </Stat>
        </Item>

        {next && (
          <Item className="mt-6">
            <div className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-honey-300 via-honey-400 to-honey-500 p-6 text-honey-ink shadow-honey sm:p-8">
              <div className="honeycomb pointer-events-none absolute inset-0" />
              <div className="relative flex items-center justify-between gap-6">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider opacity-70">
                    <PlayIcon size={12} weight="fill" /> Continue
                  </p>
                  <h2 className="mt-2 truncate font-display text-2xl font-semibold sm:text-3xl">{next.title}</h2>
                  <p className="mt-1 text-sm font-medium opacity-75">
                    {next.knownCount} / {next.cardCount} known
                  </p>
                  <div className="mt-4 h-2 w-full max-w-xs overflow-hidden rounded-full bg-honey-ink/15">
                    <div className="h-full rounded-full bg-honey-ink" style={{ width: `${next.progress}%` }} />
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Link
                      href={`/sets/${next.id}/flashcards`}
                      className={`inline-flex h-11 items-center gap-2 rounded-2xl bg-honey-ink px-4 text-sm font-semibold text-honey-300 hover:-translate-y-0.5 hover:bg-black hover:ring-4 hover:ring-honey-ink/15 ${pressable}`}
                    >
                      <CardsThreeIcon size={18} weight="fill" /> Flashcards
                    </Link>
                    <Link
                      href={`/sets/${next.id}/quiz`}
                      className={`inline-flex h-11 items-center gap-2 rounded-2xl bg-honey-ink/10 px-4 text-sm font-semibold hover:-translate-y-0.5 hover:bg-honey-ink/20 ${pressable}`}
                    >
                      <ExamIcon size={18} weight="fill" /> Quiz
                    </Link>
                  </div>
                </div>
                <div className="relative hidden size-36 shrink-0 sm:block">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 size-full text-honey-ink/10" aria-hidden>
                    <path d="M50 8 86 29v42L50 92 14 71V29z" fill="currentColor" stroke="currentColor" strokeWidth="10" strokeLinejoin="round" />
                  </svg>
                  <Bee className="absolute inset-6 size-24" hover />
                </div>
              </div>
            </div>
          </Item>
        )}
      </Stagger>

      <section className="mt-12">
        <SectionTitle
          action={
            <Link href="/library" className={buttonClass("ghost", "group h-9 px-3 text-honey-600 hover:text-honey-700")}>
              All sets <ArrowRightIcon size={14} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          }
          icon={<BooksIcon size={22} weight="fill" />}
        >
          Your sets
        </SectionTitle>
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sets.slice(0, 5).map((set) => (
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
      <span className={`grid size-10 place-items-center rounded-2xl ${tone}`}>{icon}</span>
      <p className="mt-4 font-display text-3xl font-semibold tabular-nums">{children}</p>
      <p className="mt-0.5 text-xs font-medium text-ink-500 sm:text-sm">{label}</p>
    </div>
  );
}

function Empty() {
  return (
    <div className="grid min-h-[75dvh] place-items-center px-4">
      <Stagger className="text-center">
        <Item>
          <Bee className="mx-auto size-24" hover />
        </Item>
        <Item>
          <h1 className="mt-6 font-display text-3xl font-semibold">No sets yet</h1>
          <p className="mt-2 text-sm text-ink-500">Make one from notes, a syllabus, or a vocab list.</p>
        </Item>
        <Item>
          <Link href="/new" className={buttonClass("primary", "mt-6")}>
            <PlusIcon size={18} weight="bold" /> New set
          </Link>
        </Item>
      </Stagger>
    </div>
  );
}
