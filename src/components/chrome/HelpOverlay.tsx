"use client";

import { useModalFocusTrap } from "@/hooks/useModalFocusTrap";

const SHORTCUTS = [
  { key: "J / ↓", label: "Next section" },
  { key: "K / ↑", label: "Previous section" },
  { key: "T", label: "Open settings" },
  { key: "M", label: "Toggle motion" },
  { key: "C", label: "Jump to contact" },
  { key: "/", label: "Toggle this help" },
  { key: "Esc", label: "Close any open panel" },
];

export function HelpOverlay({ onClose }: { onClose: () => void }) {
  const containerRef = useModalFocusTrap<HTMLDivElement>();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-[2px]"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={containerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        className="w-full max-w-sm rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-solid)] p-6 shadow-2xl outline-none"
      >
        <div className="flex items-center justify-between">
          <h2
            id="help-title"
            className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]"
          >
            Shortcuts
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shortcuts"
            className="rounded-md px-2 py-1 text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            ✕
          </button>
        </div>

        <dl className="mt-5 space-y-2.5">
          {SHORTCUTS.map((shortcut) => (
            <div key={shortcut.key} className="flex items-center justify-between gap-4">
              <dt className="rounded border border-[var(--border-soft)] px-2 py-0.5 font-mono text-xs text-[var(--ink)]">
                {shortcut.key}
              </dt>
              <dd className="text-sm text-[var(--ink-muted)]">{shortcut.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
