"use client";

import type { ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";

/**
 * Wraps content in a one-shot entry reveal.
 *
 * Isolated into its own client component so `SectionShell` — and therefore
 * every section that uses it — can stay on the server. The children are passed
 * through as a prop, so they are still server-rendered even though this
 * wrapper is not.
 */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={cn("reveal", className)}>
      {children}
    </div>
  );
}
