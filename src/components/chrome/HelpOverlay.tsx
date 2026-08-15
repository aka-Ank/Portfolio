"use client";

import { motion } from "motion/react";
import { useModalFocusTrap } from "@/hooks/useModalFocusTrap";

const SHORTCUTS = [
  { key: "G", label: "Go to a chapter" },
  { key: "C", label: "Jump to Contact" },
  { key: "R", label: "Toggle reduced motion" },
  { key: "P", label: "Play / pause ambient sound" },
  { key: "/", label: "Toggle this help" },
  { key: "Esc", label: "Close any open panel" },
];

/** Accessible keyboard-shortcut reference — docs/08-roadmap.md Phase 4:
 * "visible hints and an accessible help overlay." */
export function HelpOverlay({ onClose }: { onClose: () => void }) {
  const containerRef = useModalFocusTrap<HTMLDivElement>();

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
      <motion.div
        ref={containerRef}
        tabIndex={-1}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ type: "spring", stiffness: 140, damping: 22 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        className="w-full max-w-sm rounded-lg bg-[var(--paper)] p-6 text-[var(--ink)] shadow-2xl outline-none"
      >
        <div className="flex items-center justify-between">
          <h2 id="help-title" className="font-[family-name:var(--font-display)] text-2xl">
            Keyboard shortcuts
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded px-2 py-1 text-[var(--muted-foreground)] outline-offset-2 hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
          >
            ✕
          </button>
        </div>
        <dl className="mt-4 flex flex-col gap-2">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="flex items-center justify-between gap-4">
              <dt className="rounded border border-[var(--border)] px-2 py-0.5 font-[family-name:var(--font-mono)] text-xs">
                {s.key}
              </dt>
              <dd className="text-sm text-[var(--muted-foreground)]">{s.label}</dd>
            </div>
          ))}
        </dl>
      </motion.div>
    </div>
  );
}
