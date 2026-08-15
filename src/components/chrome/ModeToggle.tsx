"use client";

import Link from "next/link";
import { useWorldStore } from "@/world/state/useWorldStore";

/** Visible, easy toggle to the classic route — preserves the visitor's
 * place via the current chapter's anchor id (docs/08-roadmap.md Phase 4). */
export function ModeToggle() {
  const currentChapter = useWorldStore((s) => s.currentChapter);

  return (
    <Link
      href={`/classic#${currentChapter}`}
      className="pointer-events-auto rounded px-2 py-1 text-sm outline-offset-2 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
    >
      Classic mode
    </Link>
  );
}
