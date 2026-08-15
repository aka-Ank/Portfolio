"use client";

import { useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { getWorldState, useWorldStore } from "@/world/state/useWorldStore";
import { scrollToChapter } from "@/world/systems/scroll-camera/scrollToChapter";
import { HelpOverlay } from "./HelpOverlay";
import { SceneBookmarks } from "./SceneBookmarks";

/**
 * Global shortcut listener — P/R/G/C/? per docs/08-roadmap.md Phase 4.
 * Ignores keystrokes while typing in an input/textarea (e.g. the future
 * chatbot's message box) so shortcuts never fight normal text entry.
 */
export function KeyboardShortcuts({
  audioEnabled,
  onToggleMute,
}: {
  audioEnabled: boolean;
  onToggleMute: () => void;
}) {
  const panel = useWorldStore((s) => s.chromePanel);
  const setPanel = useWorldStore((s) => s.setChromePanel);
  const setManualReducedMotion = useWorldStore((s) => s.setManualReducedMotion);
  const reducedMotion = useWorldStore((s) => s.reducedMotion);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA"].includes(target.tagName) || target.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key) {
        case "/":
        case "?":
          e.preventDefault();
          setPanel(getWorldState().chromePanel === "help" ? null : "help");
          break;
        case "g":
        case "G":
          setPanel(getWorldState().chromePanel === "bookmarks" ? null : "bookmarks");
          break;
        case "c":
        case "C":
          scrollToChapter("campfire");
          setPanel(null);
          break;
        case "r":
        case "R":
          setManualReducedMotion(!reducedMotion);
          break;
        case "p":
        case "P":
          if (audioEnabled) onToggleMute();
          break;
        case "Escape":
          setPanel(null);
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [audioEnabled, onToggleMute, reducedMotion, setManualReducedMotion, setPanel]);

  return (
    <AnimatePresence>
      {panel === "help" && <HelpOverlay key="help" onClose={() => setPanel(null)} />}
      {panel === "bookmarks" && (
        <SceneBookmarks key="bookmarks" onClose={() => setPanel(null)} />
      )}
    </AnimatePresence>
  );
}
