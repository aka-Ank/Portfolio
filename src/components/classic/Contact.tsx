import { contactContent } from "@/content/sections";

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="classic-contact-heading"
      className="mx-auto max-w-2xl px-6 py-20 text-center"
    >
      <h2
        id="classic-contact-heading"
        className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]"
      >
        {contactContent.heading}
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-[var(--ink-muted)]">{contactContent.body}</p>

      <a
        href={`mailto:${contactContent.email}`}
        className="mt-8 inline-block rounded-lg bg-[var(--accent-ink)] px-7 py-3.5 text-[15px] font-medium text-[var(--surface-solid)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
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
