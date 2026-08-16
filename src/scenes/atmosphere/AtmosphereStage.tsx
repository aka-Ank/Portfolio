"use client";

import { useEffect, useRef } from "react";
import { SECTIONS, sectionMeta, type MoodId } from "@/content/sections";
import { useAppStore, selectReducedMotion } from "@/state/useAppStore";
import { DEPTH_PARALLAX, type Depth, type MoodArt } from "./MoodSvg";
import { EntranceMeadow } from "./moods/EntranceMeadow";
import { RiverValley } from "./moods/RiverValley";
import { AncientGrove } from "./moods/AncientGrove";
import { MechanicalJungle } from "./moods/MechanicalJungle";
import { Observatory } from "./moods/Observatory";
import { Campfire } from "./moods/Campfire";
import { ParticleField } from "./ParticleField";

const MOOD_ART: Record<MoodId, MoodArt> = {
  meadow: EntranceMeadow,
  valley: RiverValley,
  grove: AncientGrove,
  jungle: MechanicalJungle,
  observatory: Observatory,
  campfire: Campfire,
};

const MOOD_IDS = Object.keys(MOOD_ART) as MoodId[];
const DEPTHS: Depth[] = ["far", "mid", "near"];

/** Total travel in px across the entire page, per plane. Small on purpose:
 * this is a depth cue, not a ride. */
const PARALLAX_RANGE = 130;

/**
 * The fixed backdrop the whole site sits on: sky, the key light, the six
 * moods (crossfaded), the haze band, and the ambient particle pass.
 *
 * All six moods stay mounted and are crossfaded by opacity rather than being
 * swapped in and out. They are static SVG of a few dozen nodes each, so the
 * cost is negligible, and it means a section change can never produce a
 * mount-time flash — which is exactly the "sudden transition" the brief
 * rules out.
 */
export function AtmosphereStage() {
  const activeSection = useAppStore((s) => s.activeSection);
  const reducedMotion = useAppStore(selectReducedMotion);
  const stageRef = useRef<HTMLDivElement>(null);

  const meta = sectionMeta(activeSection);
  const activeMood = meta.mood;
  const journey = SECTIONS.findIndex((s) => s.id === activeSection) / (SECTIONS.length - 1);

  // The key light tracks the journey: it rises out of the left at the meadow
  // and has set behind the right by the campfire. Written as CSS variables so
  // the move is a plain CSS transition rather than a JS animation.
  const glowX = 12 + journey * 76;
  const glowY = 64 - Math.sin(journey * Math.PI) * 44;

  useEffect(() => {
    if (reducedMotion) return;
    const stage = stageRef.current;
    if (!stage) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollable = document.scrollingElement ?? document.documentElement;
      const max = scrollable.scrollHeight - scrollable.clientHeight;
      const progress = max > 0 ? scrollable.scrollTop / max : 0;
      stage.style.setProperty("--parallax", String(progress));
    };

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={stageRef}
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
      style={{ "--parallax": 0 } as React.CSSProperties}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--sky-top)_0%,var(--sky-mid)_46%,var(--sky-horizon)_100%)]" />

      {/* The key light — sun or moon depending on the family, never drawn as
          a hard disc. A soft pool of light is what a painted sky actually
          looks like, and it never blows out the content in front of it. */}
      <div
        className="absolute h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-[60px] transition-[left,top] duration-[1600ms] ease-out motion-reduce:transition-none"
        style={{
          left: `${glowX}%`,
          top: `${glowY}%`,
          background:
            "radial-gradient(circle, var(--glow) 0%, color-mix(in oklch, var(--glow) 30%, transparent) 42%, transparent 70%)",
        }}
      />

      {DEPTHS.map((depth) => (
        <div
          key={depth}
          className="absolute inset-x-0 bottom-0 top-0 will-change-transform"
          style={{
            transform: `translate3d(0, calc(var(--parallax) * ${(DEPTH_PARALLAX[depth] * PARALLAX_RANGE).toFixed(1)}px), 0)`,
          }}
        >
          {MOOD_IDS.map((mood) => {
            const Art = MOOD_ART[mood];
            return (
              <div
                key={mood}
                className="absolute inset-0 transition-opacity duration-[1100ms] ease-in-out motion-reduce:duration-200"
                style={{ opacity: mood === activeMood ? 1 : 0 }}
              >
                <Art depth={depth} />
              </div>
            );
          })}
        </div>
      ))}

      {/* Haze band. Weather changes its strength, never its hue — mist and
          rain are the same world in different conditions. */}
      <div
        className="absolute inset-x-0 bottom-0 h-[62%] transition-opacity duration-[1400ms] motion-reduce:duration-200"
        style={{
          opacity: "var(--haze-strength, 0.28)",
          background:
            "linear-gradient(to top, var(--haze) 0%, color-mix(in oklch, var(--haze) 40%, transparent) 55%, transparent 100%)",
        }}
      />

      <ParticleField />
    </div>
  );
}
