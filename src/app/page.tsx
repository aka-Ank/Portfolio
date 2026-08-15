"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useWorldStore } from "@/world/state/useWorldStore";
import { registerWorldTransitions } from "@/world/scenes/transitions";
import { ChapterWatcher } from "@/world/systems/navigation/ChapterWatcher";
import { ChapterOverlay } from "@/components/chrome/ChapterOverlay";
import { DeepDiveLayer } from "@/components/chrome/DeepDiveLayer";
import { Preloader } from "@/components/chrome/Preloader";
import { AudioControls } from "@/components/chrome/AudioControls";
import { TimeOfDayToggle } from "@/components/chrome/TimeOfDayToggle";
import { ReducedMotionToggle } from "@/components/chrome/ReducedMotionToggle";
import { ModeToggle } from "@/components/chrome/ModeToggle";
import { KeyboardShortcuts } from "@/components/chrome/KeyboardShortcuts";
import { AmbientAudioBridge } from "@/world/systems/audio/AmbientAudioBridge";
import { initAudio, setMuted } from "@/world/systems/audio/audioManager";
import type { DeviceTier, TimeOfDayAnchor } from "@/types/world";

// R3F/WebGL isn't SSR-safe — standard Next.js pattern for canvas content.
const WorldCanvas = dynamic(
  () => import("@/world/engine/WorldCanvas").then((m) => m.WorldCanvas),
  { ssr: false },
);
const World = dynamic(() => import("@/world/scenes/World").then((m) => m.World), {
  ssr: false,
});

const ANCHORS: TimeOfDayAnchor[] = ["dawn", "day", "sunset", "night"];
const TIERS: DeviceTier[] = ["low", "mid", "high"];

export default function Home() {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
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
    registerWorldTransitions();
  }, []);

  function enter() {
    initAudio();
    setMuted(false);
    setAudioEnabled(true);
    setMutedState(false);
    goToChapter("entrance");
    setPhase("active");
  }

  function toggleMute() {
    const next = !muted;
    setMutedState(next);
    setMuted(next);
  }

  return (
    <main id="main-content" className="relative">
      <ChapterWatcher />
      <AmbientAudioBridge enabled={audioEnabled} />
      <ChapterOverlay />
      <DeepDiveLayer />
      <KeyboardShortcuts audioEnabled={audioEnabled} onToggleMute={toggleMute} />

      <div
        id="scene-transition-veil"
        style={{ opacity: 0 }}
        className="pointer-events-none fixed inset-0 z-40 bg-white"
        aria-hidden
      />

      <div className="fixed inset-0 z-0">
        <WorldCanvas>
          <World />
        </WorldCanvas>
      </div>

      {phase === "preloading" && <Preloader onEnter={enter} />}

      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 flex flex-wrap items-center gap-3 bg-[var(--scrim)] p-3 text-sm text-[var(--ink-inverse)]">
        <TimeOfDayToggle />
        <ReducedMotionToggle />
        {audioEnabled && <AudioControls muted={muted} onToggleMute={toggleMute} />}
        <ModeToggle />

        <button
          onClick={() => setDebugOpen((v) => !v)}
          className="pointer-events-auto rounded bg-white/10 px-2 py-1 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
        >
          Dev tools {debugOpen ? "▲" : "▼"}
        </button>

        {debugOpen && (
          <>
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
          </>
        )}

        <div className="ml-auto pointer-events-none opacity-80">
          {currentChapter} · {Math.round(journeyProgress * 100)}% · phase: {phase}
          {loreFound.length > 0 ? ` · lore found: ${loreFound.length}` : ""}
          <span className="ml-2 opacity-60">· press / for shortcuts</span>
        </div>
      </div>

      {/* Tall scroll spacer — Lenis + GSAP ScrollTrigger drive journeyProgress
          off this; 100vh per chapter. See docs/02-architecture.md
          `world/scenes/`. */}
      <div className="pointer-events-none" style={{ height: "700vh" }} aria-hidden />
    </main>
  );
}
