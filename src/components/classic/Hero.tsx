import { heroContent } from "@/content/sections";

/** Classic mode's hero — the same copy as the immersive Entrance, in plain
 * semantic HTML with no backdrop behind it. */
export function Hero() {
  return (
    <section id="hero" aria-labelledby="classic-hero-heading" className="mx-auto max-w-3xl px-6 pb-16 pt-24">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent-ink)]">
        {heroContent.eyebrow}
      </p>
      <h1
        id="classic-hero-heading"
        className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2.75rem,8vw,5rem)] leading-[0.98] tracking-[-0.02em] text-[var(--ink)]"
      >
        {heroContent.name}
      </h1>
      <p className="mt-4 max-w-xl text-xl leading-relaxed text-[var(--ink-muted)]">
        {heroContent.tagline}
      </p>

      <dl className="mt-10 grid gap-6 sm:grid-cols-2">
        {heroContent.split.map((track) => (
          <div key={track.track} className="border-t border-[var(--border-soft)] pt-4">
            <dt className="font-mono text-[11px] uppercase tracking-wider text-[var(--accent-ink)]">
              {track.label}
            </dt>
            <dd className="mt-2 text-[15px] leading-relaxed text-[var(--ink-muted)]">
              {track.line}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
