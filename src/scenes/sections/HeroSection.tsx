"use client";

import { heroContent, sectionMeta } from "@/content/sections";
import { sectionElementId, scrollToSection } from "@/systems/scroll/scrollToSection";
import { useReveal } from "@/hooks/useReveal";

/**
 * The first screen. One name, one line of identity, the two tracks stated
 * plainly, and one clear way forward — nothing else. Everything the site has
 * to prove about restraint, it proves here or not at all.
 */
export function HeroSection() {
  const meta = sectionMeta("hero");
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <section
      id={sectionElementId("hero")}
      aria-labelledby="hero-heading"
      className="flex min-h-dvh snap-start flex-col justify-center px-6 py-28 sm:px-10"
    >
      <div ref={revealRef} className="reveal mx-auto w-full max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent-ink)]">
          {meta.place}
        </p>

        <h1
          id="hero-heading"
          className="mt-5 font-[family-name:var(--font-display)] text-[clamp(3rem,10vw,6.5rem)] leading-[0.95] tracking-[-0.02em] text-[var(--ink)]"
        >
          {heroContent.name}
        </h1>

        <p className="mt-5 max-w-xl text-xl leading-relaxed text-[var(--ink-muted)]">
          {heroContent.tagline}
        </p>

        {/* The SDE/AIML split, on the first screen rather than discovered
            three sections in. A visitor who reads nothing else should still
            leave knowing both tracks are real work. */}
        <dl className="mt-12 grid gap-px overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--border-soft)] sm:grid-cols-2">
          {heroContent.split.map((track) => (
            <div key={track.track} className="bg-[var(--surface)] p-6 backdrop-blur-md">
              <dt className="font-mono text-[11px] uppercase tracking-wider text-[var(--accent-ink)]">
                {track.label}
              </dt>
              <dd className="mt-2 text-[15px] leading-relaxed text-[var(--ink-muted)]">
                {track.line}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => scrollToSection(heroContent.primaryCta.target)}
            className="rounded-lg bg-[var(--accent-ink)] px-6 py-3 text-[15px] font-medium text-[var(--surface-solid)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            {heroContent.primaryCta.label}
          </button>
          <button
            type="button"
            onClick={() => scrollToSection(heroContent.secondaryCta.target)}
            className="rounded-lg border border-[var(--border-soft)] px-6 py-3 text-[15px] text-[var(--ink)] transition-colors hover:bg-[var(--surface-raised)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            {heroContent.secondaryCta.label}
          </button>
        </div>
      </div>
    </section>
  );
}
