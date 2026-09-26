import { LoginForm } from "./login-form";

export const metadata = { title: "Log in · Study Bee" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  return (
    <main className="flex min-h-dvh justify-center px-4 pb-10 pt-[max(2.5rem,10vh)]">
      <LoginForm confirmFailed={error === "confirm"} />
    </main>
  );
}
