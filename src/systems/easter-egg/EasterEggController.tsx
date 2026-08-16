"use client";

import { useCallback, useRef, useState } from "react";
import { useAppStore } from "@/state/useAppStore";
import { useKonamiCode } from "./useKonamiCode";

const ALTERNATE_ATMOSPHERE_MS = 5000;

/**
 * Mount once, globally. The world slips to night wherever the visitor
 * happens to be, then eases back to whatever time mode they were actually
 * on — through the same damped ThemeDriver everything else uses, so it reads
 * as the light changing rather than as a toggle being flipped.
 */
export function EasterEggController() {
  const [toastVisible, setToastVisible] = useState(false);
  const timers = useRef<number[]>([]);

  const handleTrigger = useCallback(() => {
    const { timeMode, setTimeMode } = useAppStore.getState();
    if (timeMode === "night") return;

    setTimeMode("night");
    setToastVisible(true);
    timers.current.forEach(window.clearTimeout);
    timers.current = [
      window.setTimeout(() => setTimeMode(timeMode), ALTERNATE_ATMOSPHERE_MS),
      window.setTimeout(() => setToastVisible(false), ALTERNATE_ATMOSPHERE_MS + 600),
    ];
  }, []);

  useKonamiCode(handleTrigger);

  if (!toastVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-6">
      <p className="rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-5 py-2 text-sm text-[var(--ink)] backdrop-blur-md">
        Konami accepted — night, briefly.
      </p>
    </div>
  );
}
