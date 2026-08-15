"use client";

import { useSyncExternalStore } from "react";

function noopSubscribe() {
  // Support never changes after mount — same SSR-safe pattern as
  // useVoiceRecognition's `supported` (no setState-in-effect, no
  // hydration mismatch).
  return () => {};
}

function getSnapshot(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  // Assume supported during SSR/hydration — corrected client-side on the
  // very next render. page.tsx's Canvas is already client-only
  // (dynamic import, ssr:false), so there's no server-rendered 3D content
  // this could mismatch against.
  return true;
}

/**
 * Proactive WebGL availability check, run before ever attempting to mount
 * the Canvas — docs/07-accessibility-and-testing.md "if WebGL is
 * unavailable... never a blank canvas or console-only error." Paired with
 * WebGLErrorBoundary as a reactive safety net for failures this check
 * can't catch (context creation succeeds but Three.js's renderer setup
 * still throws for some other reason).
 */
export function useWebGLSupport(): boolean {
  return useSyncExternalStore(noopSubscribe, getSnapshot, getServerSnapshot);
}
