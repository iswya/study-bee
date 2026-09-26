import { GearSixIcon } from "@phosphor-icons/react/ssr";
import { redirect } from "next/navigation";
import { PageTitle } from "@/components/ui";
import { getMyProfile, getUser } from "@/lib/data";
import { SettingsForm } from "./settings-form";

export const metadata = { title: "Settings · Study Bee" };

export default async function SettingsPage() {
  const [profile, user] = await Promise.all([getMyProfile(), getUser()]);
  if (!profile || !user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-8 md:py-10">
      <PageTitle icon={<GearSixIcon size={24} weight="duotone" />}>Settings</PageTitle>
      <SettingsForm profile={profile} email={user.email} />
    </div>
  );
}
