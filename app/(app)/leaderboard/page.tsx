import { TrophyIcon } from "@phosphor-icons/react/ssr";
import { PageTitle } from "@/components/ui";
import { getLeaderboard, getMyProfile } from "@/lib/data";
import { LeaderboardView } from "./leaderboard-view";

export const metadata = { title: "Leaderboard · Study Bee" };

export default async function LeaderboardPage({ searchParams }: PageProps<"/leaderboard">) {
  const period = (await searchParams).period === "all" ? "all" : "week";
  const [rows, me] = await Promise.all([getLeaderboard(period), getMyProfile()]);
  const hidden = !!me && (me.is_private || !me.show_on_leaderboard);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-8 md:py-10">
      <PageTitle icon={<TrophyIcon size={24} weight="duotone" />}>Leaderboard</PageTitle>
      <LeaderboardView rows={rows} period={period} hidden={hidden} />
    </div>
  );
}
