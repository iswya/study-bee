"use client";

import { useEffect } from "react";
import { touch } from "@/lib/social-actions";

// Tells the server you're here every 2 minutes while the tab is visible,
// which powers the green "online" dot friends see.
export function Presence() {
  useEffect(() => {
    const ping = () => document.visibilityState === "visible" && touch();
    ping();
    const id = setInterval(ping, 120_000);
    document.addEventListener("visibilitychange", ping);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", ping);
    };
  }, []);
  return null;
}
