import { contactContent, sectionMeta } from "@/content/sections";
import { sectionElementId } from "@/systems/scroll/scrollToSection";

/**
 * The Campfire. The only section that centres itself and drops the eyebrow
 * rule — the journey ends by getting quieter, not by adding one more panel.
 */
export function ContactSection() {
  const meta = sectionMeta("contact");

  return (
    <section
      id={sectionElementId("contact")}
      aria-labelledby="contact-heading"
      className="flex min-h-dvh snap-start flex-col items-center justify-center px-6 py-28 text-center sm:px-10"
    >
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent-ink)]">
        {meta.place}
      </p>

      <h2
        id="contact-heading"
        className="mt-5 max-w-2xl font-[family-name:var(--font-display)] text-4xl leading-[1.15] text-[var(--ink)] sm:text-5xl"
      >
        {contactContent.heading}
      </h2>

      <p className="mt-4 max-w-sm text-[17px] leading-relaxed text-[var(--ink-muted)]">
        {contactContent.body}
      </p>

      <a
        href={`mailto:${contactContent.email}`}
        className="mt-10 rounded-lg bg-[var(--accent-ink)] px-7 py-3.5 text-[15px] font-medium text-[var(--surface-solid)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
      >
        {contactContent.email}
      </a>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
        {contactContent.links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="rounded text-[var(--ink)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            {link.label}
          </a>
        ))}
        <a
          href="/api/resume"
          className="rounded text-[var(--ink)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
        >
          Résumé (PDF)
        </a>
      </div>
    </section>
  );
}
