"use client";

import { useEffect } from "react";
import { useWorldStore } from "@/world/state/useWorldStore";
import { crossfadeAmbienceTo } from "./audioManager";

/**
 * Crossfades the ambient bed whenever the target time-of-day anchor changes.
 * Only acts once the visitor has opted in (see docs/06 "audio autoplay" —
 * sound starts muted/uninitialized until a deliberate first interaction,
 * since browsers block autoplay anyway). Mount once, anywhere in the tree.
 */
export function AmbientAudioBridge({ enabled }: { enabled: boolean }) {
  const targetAnchor = useWorldStore((s) => s.targetAnchor);

  useEffect(() => {
    if (!enabled) return;
    crossfadeAmbienceTo(targetAnchor);
  }, [enabled, targetAnchor]);

  return null;
}
