import { campfireContent } from "@/world/scenes/campfire/content";

export function Contact() {
  return (
    <section
      id="campfire"
      aria-label="Contact"
      className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-24 text-center"
    >
      <h2 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
        {campfireContent.heading}
      </h2>
      <p className="mt-3 max-w-sm text-[var(--muted-foreground)]">{campfireContent.body}</p>

      <div className="mt-8 flex flex-col items-center gap-4">
        <a
          href={`mailto:${campfireContent.email}`}
          className="rounded-md bg-[var(--primary)] px-6 py-3 text-[var(--primary-foreground)] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
        >
          {campfireContent.email}
        </a>
        <div className="flex gap-6 text-sm">
          {campfireContent.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[var(--ink)] underline-offset-4 hover:underline"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/api/resume"
            className="text-[var(--ink)] underline-offset-4 hover:underline"
          >
            Résumé (PDF)
          </a>
        </div>
      </div>
    </section>
  );
}
