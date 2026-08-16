"use client";

import { useEffect } from "react";
import { SECTIONS } from "@/content/sections";
import { useAppStore, selectReducedMotion } from "@/state/useAppStore";
import { scrollToSection } from "@/systems/scroll/scrollToSection";
import { HelpOverlay } from "./HelpOverlay";
import { ControlPanel } from "./ControlPanel";

/** True when the keypress belongs to something the visitor is typing into. */
function isTypingTarget(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  if (!element) return false;
  return (
    element.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName)
  );
}

/**
 * Global shortcuts, and the panels they open. Mounted once on the main
 * route.
 *
 * The arrow/J/K bindings deliberately do **not** preventDefault on plain
 * arrow keys — native scrolling already works, and the CSS snap points give
 * it the same landing position. They only step explicitly when the visitor
 * uses J/K, which no browser has a default for.
 */
export function KeyboardShortcuts() {
  const chromePanel = useAppStore((s) => s.chromePanel);
  const setChromePanel = useAppStore((s) => s.setChromePanel);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;

      const state = useAppStore.getState();

      if (event.key === "Escape") {
        state.setChromePanel(null);
        return;
      }

      const step = (delta: number) => {
        const index = SECTIONS.findIndex((s) => s.id === state.activeSection);
        const next = SECTIONS[Math.min(Math.max(index + delta, 0), SECTIONS.length - 1)];
        if (next) scrollToSection(next.id);
      };

      switch (event.key.toLowerCase()) {
        case "j":
          step(1);
          break;
        case "k":
          step(-1);
          break;
        case "t":
          state.setChromePanel(state.chromePanel === "controls" ? null : "controls");
          break;
        case "c":
          scrollToSection("contact");
          break;
        case "m": {
          const reduced = selectReducedMotion(state);
          state.setManualReducedMotion(!reduced);
          break;
        }
        case "/":
          event.preventDefault();
          state.setChromePanel(state.chromePanel === "help" ? null : "help");
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (chromePanel === "help") return <HelpOverlay onClose={() => setChromePanel(null)} />;
  if (chromePanel === "controls") return <ControlPanel onClose={() => setChromePanel(null)} />;
  return null;
}
