import {
  BooksIcon,
  CalendarBlankIcon,
  CardsThreeIcon,
  CheckCircleIcon,
  FireIcon,
  LockSimpleIcon,
  PencilSimpleIcon,
  StackIcon,
  TargetIcon,
  TimerIcon,
  PlantIcon,
  CaretRightIcon,
} from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { HiveActivity } from "@/components/hive-activity";
import { AnimatedNumber, Item, Stagger } from "@/components/motion";
import { SetCard } from "@/components/set-card";
import { buttonClass, cardClass, cardLinkClass, SectionTitle } from "@/components/ui";
import { getProfile, getSets } from "@/lib/data";
import { timeAgo } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/u/[username]">) {
  return { title: `${(await params).username} · Study Bee` };
}

export default async function ProfilePage({ params }: PageProps<"/u/[username]">) {
  const { username } = await params;
  const profile = await getProfile(decodeURIComponent(username));
  if (!profile) notFound();
  const sets = profile.show_sets ? await getSets(profile.id) : [];
  const s = profile.stats;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-8 md:py-10">
      <Stagger>
        {/* Header */}
        <Item className={`${cardClass} relative overflow-hidden`}>
          <div className="honeycomb h-24 bg-linear-to-br from-honey-300 via-honey-400 to-honey-500 sm:h-28" />
          <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:px-6">
            <Avatar user={profile} size="lg" online={profile.online} className="-mt-12 ring-4 ring-surface rounded-[1.75rem]" />
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-3xl font-semibold">{profile.username}</h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-500">
                {profile.online ? (
                  <span className="flex items-center gap-1.5 font-semibold text-mint-600">
                    <span className="size-2 animate-pulse rounded-full bg-mint-500" /> Active now
                  </span>
                ) : profile.last_seen_at ? (
                  <span>Active {timeAgo(profile.last_seen_at)}</span>
                ) : null}
                <span className="flex items-center gap-1">
                  <CalendarBlankIcon size={14} weight="duotone" /> Joined{" "}
                  {new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              </p>
            </div>
            {profile.is_me && (
              <Link href="/settings" className={buttonClass("outline", "h-10 self-start sm:self-auto")}>
                <PencilSimpleIcon size={16} weight="bold" /> Edit profile
              </Link>
            )}
          </div>
        </Item>

        {profile.is_private ? (
          <Item className={`${cardClass} mt-6 flex flex-col items-center px-6 py-12 text-center`}>
            <span className="grid size-14 place-items-center rounded-2xl bg-ink-950/5 text-ink-500">
              <LockSimpleIcon size={26} weight="duotone" />
            </span>
            <p className="mt-4 font-display text-lg font-semibold">This profile is private</p>
          </Item>
        ) : (
          <>
            {profile.studying && (
              <Item className="mt-4">
                <Link href={`/sets/${profile.studying.id}`} className={`group flex items-center gap-3 p-4 ${cardLinkClass}`}>
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-honey-50 text-honey-600">
                    <PlantIcon size={20} weight="duotone" />
                  </span>
                  <span className="min-w-0 flex-1 text-sm">
                    <span className="text-ink-500">{profile.is_me ? "You were" : "Was"} studying </span>
                    <span className="font-semibold">{profile.studying.title}</span>
                    <span className="text-ink-500"> · {timeAgo(profile.studying.at)}</span>
                  </span>
                  <CaretRightIcon size={18} weight="bold" className="text-ink-300 transition-transform group-hover:translate-x-1 group-hover:text-honey-600" />
                </Link>
              </Item>
            )}

            {s && (
              <Item className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Stat icon={<CardsThreeIcon size={18} weight="duotone" />} tone="bg-honey-50 text-honey-600" label="Cards reviewed" value={s.cards_reviewed} />
                <Stat icon={<CheckCircleIcon size={18} weight="duotone" />} tone="bg-mint-50 text-mint-600" label="Cards known" value={s.cards_known} />
                <Stat icon={<TimerIcon size={18} weight="duotone" />} tone="bg-sky-50 text-sky-600" label="Minutes studied" value={s.minutes} />
                <Stat icon={<FireIcon size={18} weight="duotone" />} tone="bg-rose-50 text-rose-600" label="Day streak" value={s.streak} />
                <Stat icon={<TargetIcon size={18} weight="duotone" />} tone="bg-lilac-50 text-lilac-600" label="Accuracy" value={s.accuracy} suffix="%" />
                <Stat icon={<StackIcon size={18} weight="duotone" />} tone="bg-honey-50 text-honey-600" label="Sets" value={s.sets} />
              </Item>
            )}

            {profile.activity && (
              <Item className={`${cardClass} mt-4 p-5`}>
                <p className="mb-4 text-sm font-semibold text-ink-700">Last 12 weeks</p>
                <HiveActivity activity={profile.activity} />
              </Item>
            )}
          </>
        )}
      </Stagger>

      {!profile.is_private && (
        <section className="mt-10">
          <SectionTitle icon={<BooksIcon size={22} weight="fill" />}>{profile.is_me ? "Your sets" : "Sets"}</SectionTitle>
          {!profile.show_sets ? (
            <p className="flex items-center gap-2 text-sm text-ink-500">
              <LockSimpleIcon size={16} weight="duotone" /> {profile.username} keeps their sets private.
            </p>
          ) : sets.length === 0 ? (
            <p className="text-sm text-ink-500">No sets yet.</p>
          ) : (
            <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sets.map((set) => (
                <SetCard key={set.id} set={set} />
              ))}
            </Stagger>
          )}
        </section>
      )}
    </div>
  );
}

function Stat({ icon, tone, label, value, suffix = "" }: { icon: React.ReactNode; tone: string; label: string; value: number | null; suffix?: string }) {
  return (
    <div className={`${cardClass} p-4`}>
      <span className={`grid size-9 place-items-center rounded-xl ${tone}`}>{icon}</span>
      <p className="mt-3 font-display text-2xl font-semibold tabular-nums sm:text-3xl">
        {value === null ? "—" : <AnimatedNumber value={value} suffix={suffix} />}
      </p>
      <p className="text-xs font-medium text-ink-500 sm:text-sm">{label}</p>
    </div>
  );
}
