"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useWorldStore } from "@/world/state/useWorldStore";
import { registerTestTransitions } from "@/world/scenes/_test/testTransitions";
import { TestChapterWatcher } from "@/world/scenes/_test/TestChapterWatcher";
import { AmbientAudioBridge } from "@/world/systems/audio/AmbientAudioBridge";
import { initAudio, setMuted } from "@/world/systems/audio/audioManager";
import type { DeviceTier, TimeOfDayAnchor } from "@/types/world";

// R3F/WebGL isn't SSR-safe — standard Next.js pattern for canvas content.
const WorldCanvas = dynamic(
  () => import("@/world/engine/WorldCanvas").then((m) => m.WorldCanvas),
  { ssr: false },
);
const TestScene = dynamic(
  () => import("@/world/scenes/_test/TestScene").then((m) => m.TestScene),
  { ssr: false },
);

const ANCHORS: TimeOfDayAnchor[] = ["dawn", "day", "sunset", "night"];
const TIERS: DeviceTier[] = ["low", "mid", "high"];

export default function Home() {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [muted, setMutedState] = useState(false);
  const phase = useWorldStore((s) => s.phase);
  const currentChapter = useWorldStore((s) => s.currentChapter);
  const journeyProgress = useWorldStore((s) => s.journeyProgress);
  const targetAnchor = useWorldStore((s) => s.targetAnchor);
  const tier = useWorldStore((s) => s.tier);
  const reducedMotion = useWorldStore((s) => s.reducedMotion);
  const manualReducedMotion = useWorldStore((s) => s.manualReducedMotion);
  const loreFound = useWorldStore((s) => s.loreFound);
  const setTargetAnchor = useWorldStore((s) => s.setTargetAnchor);
  const setTier = useWorldStore((s) => s.setTier);
  const setManualReducedMotion = useWorldStore((s) => s.setManualReducedMotion);
  const goToChapter = useWorldStore((s) => s.goToChapter);
  const setPhase = useWorldStore((s) => s.setPhase);

  useEffect(() => {
    registerTestTransitions();
  }, []);

  function enter() {
    initAudio();
    setMuted(false);
    setAudioEnabled(true);
    setMutedState(false);
    goToChapter(currentChapter);
    setPhase("active");
  }

  function toggleMute() {
    const next = !muted;
    setMutedState(next);
    setMuted(next);
  }

  return (
    <main id="main-content" className="relative">
      <TestChapterWatcher />
      <AmbientAudioBridge enabled={audioEnabled} />

      <div
        id="test-transition-veil"
        style={{ opacity: 0 }}
        className="pointer-events-none fixed inset-0 z-40 bg-black"
        aria-hidden
      />

      <div className="fixed inset-0 z-0">
        <WorldCanvas>
          <TestScene />
        </WorldCanvas>
      </div>

      {phase === "preloading" && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[var(--paper)] text-center">
          <h1 className="font-[family-name:var(--font-display)] text-5xl text-[var(--ink)]">
            Phase 2 — Engine Proof
          </h1>
          <p className="max-w-md text-[var(--ink)]/70">
            Minimal test scene exercising the world engine: scroll-driven camera, damped
            time-of-day lighting, GSAP scene transitions, ambient audio, and the performance
            governor. Real story scenes arrive in Phase 3.
          </p>
          <button
            onClick={enter}
            className="rounded-md bg-[var(--primary)] px-6 py-3 text-[var(--primary-foreground)] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
          >
            Enter (enables sound)
          </button>
        </div>
      )}

      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 flex flex-wrap items-center gap-3 bg-[var(--scrim)] p-3 text-sm text-[var(--ink-inverse)]">
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <span className="opacity-70">Time of day:</span>
          {ANCHORS.map((anchor) => (
            <button
              key={anchor}
              onClick={() => setTargetAnchor(anchor)}
              aria-pressed={targetAnchor === anchor}
              className={`rounded px-2 py-1 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] ${
                targetAnchor === anchor ? "bg-[var(--accent)] text-[var(--accent-foreground)]" : "bg-white/10"
              }`}
            >
              {anchor}
            </button>
          ))}
        </div>

        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <span className="opacity-70">Device tier:</span>
          {TIERS.map((t) => (
            <button
              key={t}
              onClick={() => setTier(t)}
              aria-pressed={tier === t}
              className={`rounded px-2 py-1 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] ${
                tier === t ? "bg-[var(--accent)] text-[var(--accent-foreground)]" : "bg-white/10"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          onClick={() =>
            setManualReducedMotion(manualReducedMotion === null ? !reducedMotion : null)
          }
          aria-pressed={reducedMotion}
          className="pointer-events-auto rounded bg-white/10 px-2 py-1 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
        >
          Reduced motion: {reducedMotion ? "on" : "off"}
          {manualReducedMotion !== null ? " (manual)" : ""}
        </button>

        {audioEnabled && (
          <button
            onClick={toggleMute}
            aria-pressed={muted}
            className="pointer-events-auto rounded bg-white/10 px-2 py-1 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
          >
            {muted ? "Unmute" : "Mute"}
          </button>
        )}

        <div className="ml-auto pointer-events-none opacity-80">
          {currentChapter} · {Math.round(journeyProgress * 100)}% · phase: {phase}
          {loreFound.length > 0 ? ` · lore found: ${loreFound.length}` : ""}
        </div>
      </div>

      {/* Tall scroll spacer — Lenis + GSAP ScrollTrigger drive journeyProgress
          off this. Real Phase 3 chapters replace this with per-chapter
          sections; see docs/02-architecture.md `world/scenes/`. */}
      <div className="pointer-events-none" style={{ height: "300vh" }} aria-hidden />
    </main>
  );
}
