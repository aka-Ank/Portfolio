"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const AUTO_REDIRECT_MS = 4000;

/**
 * Shown when WebGL is unavailable or the Canvas failed to initialize —
 * docs/07-accessibility-and-testing.md "the visitor is routed to (or
 * offered) the classic experience automatically... never a blank canvas
 * or console-only error." Offers an immediate manual link and
 * auto-continues after a few seconds for visitors who don't interact,
 * rather than a silent redirect that never explains what happened.
 */
export function WebGLFallback() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => router.push("/classic"), AUTO_REDIRECT_MS);
    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[var(--paper)] px-6 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
        This browser can&rsquo;t run the 3D experience
      </h1>
      <p className="max-w-md text-[var(--muted-foreground)]">
        No hardware-accelerated graphics support was found. Taking you to the classic version —
        same content, no 3D required.
      </p>
      <a
        href="/classic"
        className="rounded-md bg-[var(--primary)] px-6 py-3 text-[var(--primary-foreground)] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
      >
        Continue to classic mode
      </a>
    </div>
  );
}
