import Image from "next/image";
import { accentStyles, type AvatarInfo } from "@/lib/types";

const sizes = {
  sm: { box: "size-9 rounded-xl text-lg", px: 36, dot: "size-2.5" },
  md: { box: "size-12 rounded-2xl text-2xl", px: 48, dot: "size-3" },
  lg: { box: "size-24 rounded-[1.75rem] text-5xl", px: 96, dot: "size-5 border-[3px]" },
};

export function Avatar({
  user,
  size = "md",
  online,
  className = "",
}: {
  user: Pick<AvatarInfo, "avatar_emoji" | "avatar_color" | "avatar_url" | "username">;
  size?: keyof typeof sizes;
  online?: boolean | null;
  className?: string;
}) {
  const s = sizes[size];
  const a = accentStyles[user.avatar_color] ?? accentStyles.honey;
  return (
    <span className={`relative inline-grid shrink-0 ${className}`}>
      <span className={`grid place-items-center overflow-hidden ${s.box} ${a.soft} ring-1 ring-inset ring-ink-950/5`}>
        {user.avatar_url ? (
          <Image src={user.avatar_url} alt={user.username} width={s.px} height={s.px} unoptimized className="size-full object-cover" />
        ) : (
          <span aria-hidden className="leading-none">{user.avatar_emoji}</span>
        )}
      </span>
      {online && (
        <span className={`absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-surface bg-mint-500 ${s.dot}`} aria-label="Online">
          <span className="absolute inset-0 animate-ping rounded-full bg-mint-500 opacity-60" />
        </span>
      )}
    </span>
  );
}
