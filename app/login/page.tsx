import { LoginForm } from "./login-form";

export const metadata = { title: "Log in · Study Bee" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <LoginForm confirmFailed={error === "confirm"} />
    </main>
  );
}
