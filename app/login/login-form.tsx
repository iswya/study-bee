"use client";

import { EnvelopeSimpleIcon, EyeIcon, EyeSlashIcon, LockIcon, SpinnerGapIcon, UserIcon, type Icon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useActionState, useState } from "react";
import { Bee } from "@/components/bee";
import { LogoMark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonClass, inputClass } from "@/components/ui";
import { spring } from "@/lib/motion";
import { signIn, signUp } from "./actions";

export function LoginForm({ confirmFailed }: { confirmFailed: boolean }) {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [inState, inAction, inPending] = useActionState(signIn, undefined);
  const [upState, upAction, upPending] = useActionState(signUp, undefined);
  const [showPassword, setShowPassword] = useState(false);

  const state = mode === "in" ? inState : upState;
  const pending = inPending || upPending;
  const error = state?.error ?? (confirmFailed && !state ? "That confirmation link didn't work. Try logging in." : undefined);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="relative w-full max-w-sm"
    >
      <ThemeToggle className="absolute -top-2 right-0" />

      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <LogoMark className="size-16" />
          {/* A bee keeps circling the logo */}
          <motion.div
            className="absolute left-1/2 top-1/2"
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          >
            <div className="-translate-x-3 -translate-y-[52px]">
              <Bee className="size-6" />
            </div>
          </motion.div>
        </div>
        <h1 className="mt-10 font-display text-3xl font-semibold">
          study<span className="text-honey-400">bee</span>
        </h1>
      </div>

      <div className="mt-8 rounded-card border border-line bg-surface p-6 shadow-lift">
        <div className="grid grid-cols-2 rounded-2xl bg-ink-950/5 p-1">
          {(
            [
              ["in", "Log in"],
              ["up", "Sign up"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={`relative h-10 rounded-xl text-sm font-semibold transition-colors ${
                mode === id ? "text-honey-ink" : "text-ink-500 hover:text-ink-950"
              }`}
            >
              {mode === id && <motion.span layoutId="auth-tab" className="absolute inset-0 rounded-xl bg-honey-400" transition={spring} />}
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>

        <form action={mode === "in" ? inAction : upAction} className="mt-5 space-y-3">
          <AnimatePresence initial={false}>
            {mode === "up" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <Field icon={UserIcon} name="name" placeholder="Username" autoComplete="username" autoCapitalize="none" pattern="[A-Za-z0-9_]{3,20}" title="3–20 letters, numbers, or _" required />
              </motion.div>
            )}
          </AnimatePresence>
          <Field icon={EnvelopeSimpleIcon} name="email" type="email" placeholder="Email" autoComplete="email" required />
          <div className="relative">
            <Field
              icon={LockIcon}
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoComplete={mode === "in" ? "current-password" : "new-password"}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-xl text-ink-400 hover:text-ink-950"
            >
              {showPassword ? <EyeSlashIcon size={18} weight="duotone" /> : <EyeIcon size={18} weight="duotone" />}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {(error || state?.message) && (
              <motion.p
                key={error ?? state?.message}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0, x: error ? [0, -6, 6, -3, 3, 0] : 0 }}
                exit={{ opacity: 0 }}
                className={`rounded-xl px-3 py-2 text-sm font-medium ${error ? "bg-rose-50 text-rose-600" : "bg-mint-50 text-mint-600"}`}
              >
                {error ?? state?.message}
              </motion.p>
            )}
          </AnimatePresence>

          <button type="submit" disabled={pending} className={buttonClass("primary", "h-12 w-full")}>
            {pending ? <SpinnerGapIcon size={18} weight="bold" className="animate-spin" /> : mode === "in" ? "Log in" : "Create account"}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

function Field({ icon: FieldIcon, ...props }: { icon: Icon } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="relative block">
      <FieldIcon size={18} weight="duotone" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
      <input {...props} className={`${inputClass} pl-11 pr-12`} />
    </label>
  );
}
