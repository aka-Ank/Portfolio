"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Standard WAI-ARIA dialog focus behavior, for `role="dialog"` panels that
 * mount only while shown (HelpOverlay, SceneBookmarks, ProjectDeepDive) —
 * confirmed missing by a real keyboard walkthrough (docs/07-accessibility-
 * and-testing.md's mandatory manual pass): Tab was reaching chrome buttons
 * sitting behind the translucent backdrop instead of staying inside the
 * dialog. On mount, moves focus to the dialog container (so a screen reader
 * announces its `aria-labelledby` title immediately) and traps Tab/Shift+Tab
 * within its focusable descendants; on unmount, restores focus to whatever
 * triggered the dialog.
 */
export function useModalFocusTrap<T extends HTMLElement>() {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    containerRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      const container = containerRef.current;
      if (e.key !== "Tab" || !container) return;
      const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, []);

  return containerRef;
}
