import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getSets, getUser } from "@/lib/data";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/login");
  const sets = await getSets();

  return (
    <AppShell
      userName={user.name}
      recent={sets.slice(0, 5).map(({ id, title, accent }) => ({ id, title, accent }))}
    >
      {children}
    </AppShell>
  );
}
