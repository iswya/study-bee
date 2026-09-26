"use client";

import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const isLight = () => document.documentElement.classList.contains("light");

export function ThemeToggle({ className = "" }: { className?: string }) {
  const light = useSyncExternalStore(subscribe, isLight, () => false);

  function toggle() {
    const next = !light;
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("theme", next ? "light" : "dark");
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
      title={light ? "Dark mode" : "Light mode"}
      className={`grid size-10 place-items-center overflow-hidden rounded-xl text-ink-500 transition hover:bg-ink-950/5 hover:text-ink-950 active:scale-90 ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={light ? "sun" : "moon"}
          initial={{ y: 14, rotate: -40, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: -14, rotate: 40, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {light ? <SunIcon size={20} weight="duotone" /> : <MoonIcon size={20} weight="duotone" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
