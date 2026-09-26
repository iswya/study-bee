"use client";

import {
  AtIcon,
  CameraIcon,
  CheckIcon,
  EyeIcon,
  EyeSlashIcon,
  GlobeHemisphereWestIcon,
  KeyIcon,
  LockSimpleIcon,
  MoonIcon,
  PaletteIcon,
  SignOutIcon,
  SpinnerGapIcon,
  StackIcon,
  SunIcon,
  TrashIcon,
  TrophyIcon,
  UserCircleIcon,
  CircleIcon,
  type Icon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState, useTransition } from "react";
import { signOut } from "@/app/login/actions";
import { Avatar } from "@/components/avatar";
import { useTheme } from "@/components/theme-toggle";
import { buttonClass, cardClass, inputClass, pressable } from "@/components/ui";
import { spring } from "@/lib/motion";
import { changePassword, setAvatarUrl, updatePrivacy, updateProfile, type PrivacyKey } from "@/lib/social-actions";
import { createClient } from "@/lib/supabase/client";
import { accents, accentStyles, avatarEmojis, USERNAME_RE, type Accent, type MyProfile } from "@/lib/types";

export function SettingsForm({ profile, email }: { profile: MyProfile; email: string }) {
  return (
    <div className="mt-8 space-y-5">
      <ProfileSection profile={profile} />
      <PrivacySection profile={profile} />
      <AppearanceSection />
      <PasswordSection email={email} />
      <form action={signOut}>
        <button className={buttonClass("outline", "w-full text-rose-600 hover:border-rose-500 hover:text-rose-600")}>
          <SignOutIcon size={18} weight="bold" /> Sign out
        </button>
      </form>
    </div>
  );
}

function Section({ id, icon: SectionIcon, title, children }: { id?: string; icon: Icon; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className={`${cardClass} scroll-mt-6 p-5 sm:p-6`}>
      <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold">
        <SectionIcon size={22} weight="duotone" className="text-honey-600" /> {title}
      </h2>
      {children}
    </section>
  );
}

function Status({ error, ok }: { error?: string | null; ok?: boolean }) {
  return (
    <AnimatePresence mode="wait">
      {error ? (
        <motion.p key="e" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm font-medium text-rose-600">
          {error}
        </motion.p>
      ) : ok ? (
        <motion.p key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1 text-sm font-semibold text-mint-600">
          <CheckIcon size={16} weight="bold" /> Saved
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

// ───── Profile ─────

function ProfileSection({ profile }: { profile: MyProfile }) {
  const [username, setUsername] = useState(profile.username);
  const [emoji, setEmoji] = useState(profile.avatar_emoji);
  const [color, setColor] = useState<Accent>(profile.avatar_color);
  const [photo, setPhoto] = useState(profile.avatar_url);
  const [status, setStatus] = useState<{ error?: string | null; ok?: boolean }>({});
  const [saving, startSaving] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const cleaned = username.trim().toLowerCase();
  const validName = USERNAME_RE.test(cleaned);
  const dirty = cleaned !== profile.username || emoji !== profile.avatar_emoji || color !== profile.avatar_color;

  function save() {
    setStatus({});
    startSaving(async () => {
      const r = await updateProfile({ username: cleaned, avatarEmoji: emoji, avatarColor: color });
      setStatus(r.error ? { error: r.error } : { ok: true });
    });
  }

  async function upload(file: File | undefined) {
    if (!file) return;
    setStatus({});
    setUploading(true);
    try {
      const blob = await squareJpeg(file, 256);
      const path = `${profile.id}/${Date.now()}.jpg`;
      const supabase = createClient();
      const { error } = await supabase.storage.from("avatars").upload(path, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      const url = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      const r = await setAvatarUrl(url);
      if (r.error) throw new Error(r.error);
      setPhoto(url);
      setStatus({ ok: true });
    } catch (e) {
      setStatus({ error: (e as Error).message || "Upload failed." });
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto() {
    setUploading(true);
    const r = await setAvatarUrl(null);
    setUploading(false);
    if (r.error) setStatus({ error: r.error });
    else setPhoto(null);
  }

  return (
    <Section icon={UserCircleIcon} title="Profile">
      <div className="flex items-center gap-4">
        <motion.div key={`${emoji}-${color}-${photo}`} initial={{ scale: 0.8, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={spring}>
          <Avatar user={{ username: cleaned, avatar_emoji: emoji, avatar_color: color, avatar_url: photo }} size="lg" />
        </motion.div>
        <div className="flex flex-col gap-2">
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className={buttonClass("outline", "h-10")}>
            {uploading ? <SpinnerGapIcon size={16} weight="bold" className="animate-spin" /> : <CameraIcon size={16} weight="duotone" />}
            {photo ? "Change photo" : "Upload photo"}
          </button>
          {photo && (
            <button type="button" onClick={removePhoto} disabled={uploading} className={buttonClass("danger", "h-9")}>
              <TrashIcon size={16} weight="duotone" /> Use icon instead
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
        </div>
      </div>

      <label className="mt-6 block">
        <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-ink-700">
          <AtIcon size={16} weight="bold" className="text-honey-600" /> Username
        </span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
          maxLength={20}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className={`${inputClass} ${username && !validName ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/15" : ""}`}
        />
        <span className={`mt-1 block text-xs ${username && !validName ? "text-rose-600" : "text-ink-400"}`}>
          3–20 characters · letters, numbers, and _
        </span>
      </label>

      {!photo && (
        <>
          <p className="mb-2 mt-5 text-sm font-semibold text-ink-700">Icon</p>
          <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-12">
            {avatarEmojis.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                aria-label={e}
                aria-pressed={emoji === e}
                className={`relative grid aspect-square place-items-center rounded-xl text-xl hover:bg-ink-950/5 ${pressable}`}
              >
                {emoji === e && <motion.span layoutId="emoji-ring" className="absolute inset-0 rounded-xl bg-honey-50 ring-2 ring-honey-400" transition={spring} />}
                <span className="relative">{e}</span>
              </button>
            ))}
          </div>

          <p className="mb-2 mt-5 flex items-center gap-1.5 text-sm font-semibold text-ink-700">
            <PaletteIcon size={16} weight="duotone" className="text-honey-600" /> Background
          </p>
          <div className="flex gap-1">
            {accents.map((a) => (
              <button key={a} type="button" onClick={() => setColor(a)} aria-label={a} aria-pressed={color === a} className={`relative grid size-11 place-items-center rounded-xl ${pressable}`}>
                {color === a && <motion.span layoutId="color-ring" className="absolute inset-0.5 rounded-xl ring-2 ring-ink-950" transition={spring} />}
                <span className={`size-7 rounded-lg ${accentStyles[a].soft} ring-1 ring-inset ring-ink-950/10`} />
              </button>
            ))}
          </div>
        </>
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        <Status {...status} />
        <button type="button" onClick={save} disabled={!dirty || !validName || saving} className={buttonClass("primary", "ml-auto")}>
          {saving ? <SpinnerGapIcon size={16} weight="bold" className="animate-spin" /> : <CheckIcon size={16} weight="bold" />}
          Save
        </button>
      </div>
    </Section>
  );
}

// Crop to a centered square and shrink, so avatars are small and uniform.
async function squareJpeg(file: File, size: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  canvas.getContext("2d")!.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.88));
  if (!blob) throw new Error("Couldn't read that image.");
  return blob;
}

// ───── Privacy ─────

const privacyOptions: { key: PrivacyKey; icon: Icon; title: string; body: string; invert?: boolean }[] = [
  { key: "is_private", icon: LockSimpleIcon, title: "Private profile", body: "Hide your stats, activity, and sets from everyone." },
  { key: "show_on_leaderboard", icon: TrophyIcon, title: "Show me on the leaderboard", body: "Others can see your rank and cards reviewed." },
  { key: "show_sets", icon: StackIcon, title: "Share my sets", body: "Friends can browse your sets and copy them." },
  { key: "show_activity", icon: CircleIcon, title: "Show when I'm online", body: "A green dot appears on your avatar while you're here." },
];

function PrivacySection({ profile }: { profile: MyProfile }) {
  const [values, setValues] = useState<Record<PrivacyKey, boolean>>({
    is_private: profile.is_private,
    show_on_leaderboard: profile.show_on_leaderboard,
    show_sets: profile.show_sets,
    show_activity: profile.show_activity,
  });
  const [error, setError] = useState<string | null>(null);

  async function toggle(key: PrivacyKey) {
    const next = !values[key];
    setValues((v) => ({ ...v, [key]: next })); // optimistic
    setError(null);
    const r = await updatePrivacy(key, next);
    if (r.error) {
      setValues((v) => ({ ...v, [key]: !next }));
      setError(r.error);
    }
  }

  return (
    <Section id="privacy" icon={values.is_private ? EyeSlashIcon : GlobeHemisphereWestIcon} title="Privacy">
      <div className="-mx-2 flex flex-col">
        {privacyOptions.map(({ key, icon: OptIcon, title, body }) => {
          // A private profile overrides the other sharing options.
          const disabled = key !== "is_private" && values.is_private;
          return (
            <button
              key={key}
              type="button"
              role="switch"
              aria-checked={values[key]}
              disabled={disabled}
              onClick={() => toggle(key)}
              className={`flex items-center gap-3 rounded-2xl p-2 text-left hover:bg-ink-950/[0.03] ${pressable}`}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink-950/5 text-ink-700">
                <OptIcon size={20} weight={key === "show_activity" ? "fill" : "duotone"} className={key === "show_activity" && values[key] && !disabled ? "text-mint-500" : ""} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{title}</span>
                <span className="block text-xs text-ink-500">{body}</span>
              </span>
              <Switch on={values[key] && !disabled} />
            </button>
          );
        })}
      </div>
      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
    </Section>
  );
}

function Switch({ on }: { on: boolean }) {
  return (
    <span className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors ${on ? "justify-end bg-honey-400" : "justify-start bg-ink-950/15"}`}>
      <motion.span layout transition={spring} className="size-5 rounded-full bg-white shadow" />
    </span>
  );
}

// ───── Appearance ─────

function AppearanceSection() {
  const { light, setLight } = useTheme();
  return (
    <Section icon={light ? SunIcon : MoonIcon} title="Appearance">
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-ink-950/5 p-1">
        {[
          { id: false, label: "Dark", icon: MoonIcon },
          { id: true, label: "Light", icon: SunIcon },
        ].map(({ id, label, icon: ThemeIcon }) => (
          <button key={label} type="button" onClick={() => setLight(id)} className={`relative flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold ${light === id ? "text-honey-ink" : "text-ink-500"}`}>
            {light === id && <motion.span layoutId="theme-pill" className="absolute inset-0 rounded-xl bg-honey-400" transition={spring} />}
            <ThemeIcon size={18} weight="duotone" className="relative" />
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>
    </Section>
  );
}

// ───── Password ─────

function PasswordSection({ email }: { email: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<{ error?: string | null; ok?: boolean }>({});
  const [saving, startSaving] = useTransition();

  function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus({});
    startSaving(async () => {
      const r = await changePassword(password, confirm);
      if (r.error) setStatus({ error: r.error });
      else {
        setStatus({ ok: true });
        setPassword("");
        setConfirm("");
      }
    });
  }

  return (
    <Section icon={KeyIcon} title="Password">
      <form onSubmit={save} className="space-y-3">
        <input type="email" value={email} autoComplete="username" readOnly className={`${inputClass} text-ink-500`} aria-label="Email" />
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            autoComplete="new-password"
            className={`${inputClass} pr-12`}
          />
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-xl text-ink-400 hover:text-ink-950">
            {show ? <EyeSlashIcon size={18} weight="duotone" /> : <EyeIcon size={18} weight="duotone" />}
          </button>
        </div>
        <input type={show ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" autoComplete="new-password" className={inputClass} />
        <div className="flex items-center justify-between gap-3 pt-1">
          <Status {...status} />
          <button disabled={!password || !confirm || saving} className={buttonClass("primary", "ml-auto")}>
            {saving ? <SpinnerGapIcon size={16} weight="bold" className="animate-spin" /> : <KeyIcon size={16} weight="duotone" />}
            Change password
          </button>
        </div>
      </form>
    </Section>
  );
}
