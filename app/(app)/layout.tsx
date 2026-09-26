import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getMyProfile, getSets } from "@/lib/data";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [me, sets] = await Promise.all([getMyProfile(), getSets()]);
  if (!me) redirect("/login");

  return (
    <AppShell me={me} recent={sets.slice(0, 6).map(({ id, title, accent }) => ({ id, title, accent }))}>
      {children}
    </AppShell>
  );
}
