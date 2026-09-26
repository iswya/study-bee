"use client";

import { useEffect, useRef, useState } from "react";
import { saveSession } from "@/lib/actions";

type Result = { cardId: string; known: boolean };

// Tracks one study round and saves it once when `finished` flips to true.
export function useSessionSaver(setId: string, mode: "flashcards" | "quiz", finished: boolean, results: Result[]) {
  const startedAt = useRef(0);
  const [saving, setSaving] = useState(false);
  const savedRound = useRef(false);

  useEffect(() => {
    if (!finished) {
      if (!startedAt.current) startedAt.current = Date.now();
      savedRound.current = false;
      return;
    }
    if (savedRound.current || results.length === 0) return;
    savedRound.current = true;
    const seconds = (Date.now() - startedAt.current) / 1000;
    startedAt.current = 0;
    setSaving(true);
    saveSession({ setId, mode, results, seconds }).finally(() => setSaving(false));
  }, [finished, results, setId, mode]);

  return saving;
}
